import { type BlogIllustrationKind } from '@/types/content'

/**
 * Branded, self-contained SVG illustrations for blog imagery. These replace
 * external stock photos so the blog has no binary-asset dependency: every
 * illustration is drawn in the NutriAdd sage-green / navy palette and scales
 * cleanly to any slot (hero, card, or in-body figure).
 *
 * Colors are hard-coded from the brand tokens in styles/index.css rather than
 * `currentColor` so the artwork looks identical wherever it's embedded.
 */

const GREEN = '#52b820'
const GREEN_DARK = '#438f1c'
const BLUE = '#1875bb'
const BLUE_DARK = '#135e96'
const SAGE = '#e6f5d9'
const CREAM = '#f6fbf0'

type Props = {
  kind: BlogIllustrationKind
  className?: string
  /** Decorative in most placements; a labelled figure passes its own alt via <img>-like context. */
  title?: string
}

export function BlogIllustration({ kind, className, title }: Props) {
  const shared = {
    className,
    viewBox: '0 0 400 225',
    role: title ? 'img' : 'presentation',
    'aria-hidden': title ? undefined : true,
    'aria-label': title,
    preserveAspectRatio: 'xMidYMid slice',
  } as const

  switch (kind) {
    case 'foods':
      return (
        <svg {...shared}>
          <BackdropSoft />
          {/* bowl */}
          <ellipse cx="200" cy="150" rx="96" ry="30" fill={GREEN_DARK} opacity="0.12" />
          <path d="M118 128 a82 40 0 0 0 164 0 Z" fill="#ffffff" stroke={GREEN} strokeWidth="3" />
          <path d="M118 128 h164" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
          {/* leafy greens */}
          <path d="M150 122 q-18 -34 6 -52 q10 26 -6 52 Z" fill={GREEN} />
          <path d="M168 122 q4 -40 30 -46 q-2 30 -30 46 Z" fill={GREEN_DARK} />
          {/* almonds / seeds */}
          <ellipse cx="212" cy="112" rx="12" ry="7" fill="#d9a066" transform="rotate(-18 212 112)" />
          <ellipse cx="230" cy="118" rx="12" ry="7" fill="#c98a4b" transform="rotate(14 230 118)" />
          {/* avocado */}
          <ellipse cx="252" cy="108" rx="18" ry="14" fill={GREEN} />
          <ellipse cx="252" cy="108" rx="11" ry="8" fill={SAGE} />
          <circle cx="252" cy="108" r="4" fill={GREEN_DARK} />
          <Seeds />
        </svg>
      )

    case 'chart':
      return (
        <svg {...shared}>
          <BackdropSoft />
          {/* axes */}
          <line x1="80" y1="60" x2="80" y2="176" stroke={BLUE_DARK} strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="176" x2="330" y2="176" stroke={BLUE_DARK} strokeWidth="3" strokeLinecap="round" />
          {/* bars */}
          {[
            { x: 100, h: 40, c: GREEN },
            { x: 145, h: 66, c: GREEN_DARK },
            { x: 190, h: 96, c: BLUE },
            { x: 235, h: 118, c: BLUE_DARK },
            { x: 280, h: 84, c: GREEN },
          ].map((b) => (
            <rect
              key={b.x}
              x={b.x}
              y={176 - b.h}
              width="30"
              height={b.h}
              rx="5"
              fill={b.c}
            />
          ))}
        </svg>
      )

    case 'supplement':
      return (
        <svg {...shared}>
          <BackdropSoft />
          {/* capsules */}
          <Capsule x={120} y={92} rotate={-24} a={GREEN} b="#ffffff" />
          <Capsule x={196} y={116} rotate={12} a={BLUE} b="#ffffff" />
          <Capsule x={252} y={88} rotate={-8} a={GREEN_DARK} b={SAGE} />
          {/* loose tablet */}
          <circle cx="168" cy="150" r="16" fill="#ffffff" stroke={BLUE} strokeWidth="3" />
          <line x1="168" y1="138" x2="168" y2="162" stroke={BLUE} strokeWidth="2.5" />
        </svg>
      )

    case 'sleep':
      return (
        <svg {...shared}>
          <BackdropCalm />
          {/* moon */}
          <circle cx="300" cy="70" r="26" fill="#ffffff" opacity="0.9" />
          <circle cx="310" cy="64" r="26" fill={BLUE} opacity="0.15" />
          {/* bed */}
          <rect x="96" y="150" width="208" height="30" rx="8" fill="#ffffff" />
          <rect x="96" y="132" width="70" height="30" rx="8" fill={SAGE} />
          <rect x="86" y="120" width="18" height="60" rx="6" fill={BLUE_DARK} opacity="0.7" />
          <rect x="296" y="120" width="18" height="60" rx="6" fill={BLUE_DARK} opacity="0.7" />
          {/* zzz */}
          <text x="210" y="96" fontFamily="sans-serif" fontSize="26" fontWeight="700" fill={BLUE}>
            z
          </text>
          <text x="228" y="82" fontFamily="sans-serif" fontSize="20" fontWeight="700" fill={GREEN}>
            z
          </text>
        </svg>
      )

    default:
      return (
        <svg {...shared}>
          <BackdropSoft />
          {/* molecule motif */}
          <line x1="150" y1="112" x2="210" y2="80" stroke={GREEN_DARK} strokeWidth="3" />
          <line x1="210" y1="80" x2="270" y2="112" stroke={GREEN_DARK} strokeWidth="3" />
          <line x1="210" y1="80" x2="210" y2="150" stroke={GREEN_DARK} strokeWidth="3" />
          <circle cx="150" cy="112" r="18" fill={GREEN} />
          <circle cx="270" cy="112" r="18" fill={BLUE} />
          <circle cx="210" cy="80" r="22" fill={GREEN_DARK} />
          <circle cx="210" cy="150" r="16" fill={BLUE_DARK} />
        </svg>
      )
  }
}

function BackdropSoft() {
  return (
    <>
      <defs>
        <linearGradient id="bg-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CREAM} />
          <stop offset="100%" stopColor={SAGE} />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="url(#bg-soft)" />
    </>
  )
}

function BackdropCalm() {
  return (
    <>
      <defs>
        <linearGradient id="bg-calm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef4fb" />
          <stop offset="100%" stopColor="#dbe9f7" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="url(#bg-calm)" />
    </>
  )
}

function Seeds() {
  const dots = [
    [176, 150],
    [190, 158],
    [204, 152],
    [220, 158],
    [234, 150],
    [248, 156],
  ]
  return (
    <>
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill={GREEN_DARK} opacity="0.5" />
      ))}
    </>
  )
}

function Capsule({
  x,
  y,
  rotate,
  a,
  b,
}: {
  x: number
  y: number
  rotate: number
  a: string
  b: string
}) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <rect x={x - 34} y={y - 12} width="34" height="24" rx="12" fill={a} />
      <rect x={x} y={y - 12} width="34" height="24" rx="12" fill={b} stroke={a} strokeWidth="2" />
    </g>
  )
}
