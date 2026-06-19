import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DATABASE_ID = '375784f281f980889f47000b275f29e8'

function extractText(richText) {
  return richText?.map(t => t.plain_text).join('') ?? ''
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const projects = []
    let cursor = undefined

    do {
      const response = await notion.dataSources.query({
        data_source_id: DATABASE_ID,
        sorts: [{ property: 'Year', direction: 'descending' }],
        start_cursor: cursor,
        page_size: 100,
      })

      projects.push(...response.results.map(transformPage))
      cursor = response.has_more ? response.next_cursor : undefined
    } while (cursor)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    res.status(200).json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
