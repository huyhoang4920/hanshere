import avatarImg from '../assets/Avatar.jpg'
import resumeFile from '../assets/Resume Hoang Nguyen.pdf'
import { FaLinkedin } from 'react-icons/fa'
import { Download } from 'iconoir-react'

export default function ProfilePanel() {
  const tags = ['UX Design', 'Interaction Design', 'Design Systems','Design Engineer-wannabe']
  return (
    <>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <img src={avatarImg} alt="Hans Nguyen" className="av-initials" style={{ objectFit: 'cover', background: 'transparent' }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Hans Nguyen</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            Product Designer · Vietnam
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        {tags.map(t => <span key={t} className="glass-tag">{t}</span>)}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
        I craft things with care.
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
        Always striving for the feeling of "just right"
      </div>

      <div className="profile-divider" />

      <div className="profile-actions">
        <a
          href="https://www.linkedin.com/in/hansnguyen49"
          target="_blank"
          rel="noopener noreferrer"
          className="profile-btn"
        >
          <FaLinkedin size={18} />
          LinkedIn
        </a>
        <a
          href={resumeFile}
          download="Resume Hoang Nguyen.pdf"
          className="profile-btn"
        >
          <Download width={18} height={18} strokeWidth={1.8} />
          Resume
        </a>
      </div>
    </>
  )
}
