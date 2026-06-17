// Merged-path icon components — all sub-paths combined into one <path>
// so stroke is applied as a single layer, eliminating overlap at shared endpoints

const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

export function IconUser({ size = 18, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M5 20V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V20 M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" />
    </svg>
  )
}

export function IconGraphUp({ size = 18, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M20 20H4V4 M4 16.5L12 9L15 12L19.5 7.5" />
    </svg>
  )
}

export function IconCheck({ size = 18, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M5 13L9 17L19 7" />
    </svg>
  )
}

export function IconMail({ size = 18, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M7 9L12 12.5L17 9 M2 17V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" />
    </svg>
  )
}

export function IconViewGrid({ size = 26, strokeWidth = 2, opacity = 0.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" />
    </svg>
  )
}

export function IconArrowDownRight({ size = 14, strokeWidth = 2, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M6 6L18 18 M18 8L18 18H8" />
    </svg>
  )
}

export function IconBriefcase({ size = 18, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7 M3 7H21C21.5523 7 22 7.44772 22 8V19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V8C2 7.44772 2.44772 7 3 7Z M2 13H22" />
    </svg>
  )
}

export function IconArrowLeft({ size = 15, strokeWidth = 2.5, opacity = 0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity} {...base} strokeWidth={strokeWidth}>
      <path d="M19 12H5 M11 6L5 12L11 18" />
    </svg>
  )
}
