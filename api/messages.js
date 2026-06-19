import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DATABASE_ID = '384784f281f980fcb5b4000b9e9c641a'

function extractText(richText) {
  return richText?.map(t => t.plain_text).join('') ?? ''
}

function formatTime(iso) {
  const date = new Date(iso)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

async function postMessage(req, res) {
  const { name, text } = req.body ?? {}
  if (!name?.trim() || !text?.trim()) {
    return res.status(400).json({ error: 'Name and text are required' })
  }
  try {
    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: name.slice(0, 2).toUpperCase() } }] },
        Text: { rich_text: [{ text: { content: text.slice(0, 200) } }] },
      },
    })
    res.status(201).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save message' })
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') return postMessage(req, res)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
      page_size: 100,
    })

    const messages = response.results.map(page => {
      const p = page.properties
      const name = extractText(p.Name?.title)
      return {
        id: page.id,
        name,
        initials: initials(name),
        text: extractText(p.Text?.rich_text),
        time: formatTime(p['Created time']?.created_time ?? page.created_time),
      }
    })

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')
    res.status(200).json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}
