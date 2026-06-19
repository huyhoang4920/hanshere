import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

function extractText(richText) {
  return richText?.map(t => t.plain_text).join('') ?? ''
}

function extractRich(richText) {
  if (!richText?.length) return []
  return richText.map(t => ({
    text: t.plain_text,
    href: t.href ?? null,
    bold: t.annotations?.bold ?? false,
    italic: t.annotations?.italic ?? false,
    code: t.annotations?.code ?? false,
  }))
}

function getCover(page) {
  if (!page.cover) return null
  return page.cover.type === 'external' ? page.cover.external.url : page.cover.file.url
}

function transformPage(page) {
  const p = page.properties
  return {
    id: page.id,
    title: extractText(p.Name?.title),
    icon: page.icon?.emoji ?? '',
    cover: getCover(page),
    company: p.Company?.select?.name ?? '',
    industry: p.Industry?.multi_select?.map(t => t.name) ?? [],
    scopeOfWork: p['Scope of work']?.multi_select?.map(t => t.name) ?? [],
    year: p.Year?.number ?? null,
    tools: p.Tools?.multi_select?.map(t => t.name) ?? [],
    overview: extractText(p.Overview?.rich_text),
  }
}

function transformBlock(block) {
  const { type } = block

  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', rich: extractRich(block.paragraph.rich_text) }

    case 'heading_1':
      return { type: 'heading', level: 1, rich: extractRich(block.heading_1.rich_text) }

    case 'heading_2':
      return { type: 'heading', level: 2, rich: extractRich(block.heading_2.rich_text) }

    case 'heading_3':
      return { type: 'heading', level: 3, rich: extractRich(block.heading_3.rich_text) }

    case 'callout':
      return {
        type: 'callout',
        rich: extractRich(block.callout.rich_text),
        icon: block.callout.icon?.emoji ?? '',
      }

    case 'image': {
      const img = block.image
      return {
        type: 'image',
        url: img.type === 'external' ? img.external.url : img.file.url,
        caption: extractText(img.caption),
      }
    }

    case 'video': {
      const vid = block.video
      return {
        type: 'video',
        url: vid.type === 'external' ? vid.external.url : vid.file.url,
      }
    }

    case 'bulleted_list_item':
      return { type: 'bullet', rich: extractRich(block.bulleted_list_item.rich_text) }

    default:
      return null
  }
}

async function fetchBlocks(blockId) {
  const blocks = []
  let cursor = undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const block of response.results) {
      const transformed = transformBlock(block)
      if (transformed) {
        if (block.has_children) {
          transformed.children = await fetchBlocks(block.id)
        }
        blocks.push(transformed)
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return blocks
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const [page, blocks] = await Promise.all([
      notion.pages.retrieve({ page_id: id }),
      fetchBlocks(id),
    ])

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    res.status(200).json({ ...transformPage(page), blocks })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
}
