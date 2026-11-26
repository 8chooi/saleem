'use client'

export interface SaleemMascotProps {
  size?: number
  expression?: 'happy' | 'excited' | 'thinking' | 'reading'
  className?: string
  animate?: boolean
}

/* Eyes & mouth shapes per expression */
const FACES: Record<
  NonNullable<SaleemMascotProps['expression']>,
  { leftEye: string; rightEye: string; mouth: string; brow: string }
> = {
  happy: {
    leftEye:  'M 36 58 Q 40 54 44 58',
    rightEye: 'M 56 58 Q 60 54 64 58',
    mouth:    'M 42 72 Q 50 80 58 72',
    brow:     '',
  },
  excited: {
    leftEye:  'M 35 56 Q 40 50 45 56',
    rightEye: 'M 55 56 Q 60 50 65 56',
    mouth:    'M 40 70 Q 50 82 60 70',
    brow:     '',
  },
  thinking: {
    leftEye:  'M 36 60 Q 40 56 44 60',
    rightEye: 'M 56 60 Q 60 56 64 60',
    mouth:    'M 43 73 Q 50 76 57 73',
    brow:     'M 36 50 Q 40 46 44 48  M 56 50 Q 62 48 64 52',
  },
  reading: {
    leftEye:  'M 36 61 Q 40 58 44 61',
    rightEye: 'M 56 61 Q 60 58 64 61',
    mouth:    'M 43 73 Q 50 77 57 73',
    brow:     'M 37 51 Q 40 47 44 49  M 56 49 Q 60 47 64 51',
  },
}

/* Colors */
const SKIN   = '#F5CBA7'
const SKIN_D = '#E8A87C'
const HAIR   = '#2C1810'
const SHIRT  = '#5C4AE4'
const SHIRT_D= '#3D2FB0'
const EYE    = '#1A0A00'
const CHEEK  = '#F4967A'

export default function SaleemMascot({
  size = 120,
  expression = 'happy',
  className = '',
  animate = true,
}: SaleemMascotProps) {
  const face = FACES[expression]
  const scale = size / 100

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animate ? 'animate-float' : ''} ${className}`}
      style={{ display: 'block', userSelect: 'none' }}
      aria-hidden="true"
    >
      {/* ── Body (shirt) ── */}
      <ellipse cx="50" cy="88" rx="22" ry="14" fill={SHIRT} />
      <ellipse cx="50" cy="88" rx="22" ry="14" fill={SHIRT_D} opacity="0.3" />

      {/* ── Neck ── */}
      <rect x="43" y="75" width="14" height="10" rx="5" fill={SKIN_D} />

      {/* ── Head ── */}
      <ellipse cx="50" cy="52" rx="26" ry="28" fill={SKIN} />

      {/* ── Hair ── */}
      <ellipse cx="50" cy="28" rx="26" ry="14" fill={HAIR} />
      <ellipse cx="50" cy="32" rx="20" ry="10" fill={HAIR} />
      {/* tuft */}
      <ellipse cx="50" cy="22" rx="8" ry="6" fill={HAIR} />
      <ellipse cx="38" cy="30" rx="6" ry="10" fill={HAIR} />
      <ellipse cx="62" cy="30" rx="6" ry="10" fill={HAIR} />

      {/* ── Ears ── */}
      <ellipse cx="24" cy="52" rx="5" ry="7" fill={SKIN_D} />
      <ellipse cx="76" cy="52" rx="5" ry="7" fill={SKIN_D} />

      {/* ── Eyebrows ── */}
      {face.brow && (
        <path d={face.brow} stroke={HAIR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}

      {/* ── Eyes ── */}
      <path d={face.leftEye}  stroke={EYE} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d={face.rightEye} stroke={EYE} strokeWidth="2.8" fill="none" strokeLinecap="round" />

      {/* eye shine */}
      {expression !== 'reading' && expression !== 'thinking' && (
        <>
          <circle cx="38" cy="57" r="1.2" fill="white" opacity="0.9" />
          <circle cx="58" cy="57" r="1.2" fill="white" opacity="0.9" />
        </>
      )}

      {/* ── Cheeks ── */}
      <ellipse cx="34" cy="66" rx="5" ry="3.5" fill={CHEEK} opacity="0.45" />
      <ellipse cx="66" cy="66" rx="5" ry="3.5" fill={CHEEK} opacity="0.45" />

      {/* ── Mouth ── */}
      <path d={face.mouth} stroke={EYE} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* ── Star badge on shirt ── */}
      {expression === 'excited' && (
        <text x="50" y="93" textAnchor="middle" fontSize="10" fill="white">⭐</text>
      )}

      {/* ── Book (reading expression) ── */}
      {expression === 'reading' && (
        <g transform="translate(28, 86)">
          <rect x="0" y="-6" width="20" height="14" rx="2" fill="white" opacity="0.9" />
          <line x1="10" y1="-6" x2="10" y2="8" stroke={SHIRT} strokeWidth="1" />
          <rect x="0" y="-6" width="20" height="14" rx="2" fill="none" stroke={SHIRT_D} strokeWidth="1" />
        </g>
      )}

      {/* ── Thinking bubble ── */}
      {expression === 'thinking' && (
        <>
          <circle cx="72" cy="38" r="2" fill={SHIRT} opacity="0.6" />
          <circle cx="78" cy="32" r="3" fill={SHIRT} opacity="0.5" />
          <circle cx="85" cy="25" r="5" fill={SHIRT} opacity="0.4" />
        </>
      )}
    </svg>
  )
}
