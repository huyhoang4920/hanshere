function RichText({ segments, plain = false }) {
  if (!segments?.length) return null
  return segments.map((seg, i) => {
    let node = seg.text
    if (!plain) {
      if (seg.code) node = <code key={i}>{node}</code>
      if (seg.bold) node = <strong key={i}>{node}</strong>
      if (seg.italic) node = <em key={i}>{node}</em>
    }
    if (seg.href) {
      return (
        <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" className="notion-link">
          {node}
        </a>
      )
    }
    return <span key={i}>{node}</span>
  })
}

function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  return match ? match[1] : null
}

export default function NotionRenderer({ blocks }) {
  if (!blocks?.length) return null

  const elements = []
  let bulletBuffer = []

  const flushBullets = (key) => {
    if (bulletBuffer.length) {
      elements.push(
        <ul key={`ul-${key}`}>
          {bulletBuffer.map((segs, i) => (
            <li key={i}><RichText segments={segs} /></li>
          ))}
        </ul>
      )
      bulletBuffer = []
    }
  }

  blocks.forEach((block, i) => {
    if (block.type !== 'bullet') flushBullets(i)

    switch (block.type) {
      case 'paragraph':
        elements.push(<p key={i}><RichText segments={block.rich} /></p>)
        break

      case 'heading': {
        const H = `h${block.level}`
        elements.push(<H key={i}><RichText segments={block.rich} plain /></H>)
        break
      }

      case 'callout':
        elements.push(
          <div key={i} className="callout">
            {block.icon && <span className="callout-icon">{block.icon}</span>}
            <span><RichText segments={block.rich} /></span>
          </div>
        )
        break

      case 'image':
        elements.push(
          <img key={i} src={block.url} alt={block.caption || ''} loading="lazy" />
        )
        break

      case 'video': {
        const ytId = getYouTubeId(block.url)
        elements.push(
          ytId
            ? <iframe key={i} src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen title="video" />
            : <video key={i} src={block.url} controls />
        )
        break
      }

      case 'bullet':
        bulletBuffer.push(block.rich)
        break
    }
  })

  flushBullets('end')

  return <div className="notion-content">{elements}</div>
}
