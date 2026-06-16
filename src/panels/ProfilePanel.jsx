export default function ProfilePanel() {
  const tags = ['Figma', 'UX Research', 'React', 'Shopify', 'Next.js']
  return (
    <>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <div className="av-initials">H</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Hans Nguyen</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            Product Designer · Hanoi
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        {tags.map(t => <span key={t} className="glass-tag">{t}</span>)}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
        4 years building Shopify page builder products. Exploring frontend dev and open to new roles.
      </div>
    </>
  )
}
