import type { AvatarId } from '../data/avatars'

const colours = {
  turtle: ['#2F9E68', '#F5B33C'], crab: ['#C7421C', '#F4E7D3'],
  otter: ['#12726E', '#F4E7D3'], parrot: ['#C7421C', '#F5B33C'],
  gecko: ['#2F9E68', '#8ED0E0'], puffin: ['#14282A', '#F5B33C'],
}

export function CreatureAvatar({ id, className = '' }: { id: AvatarId; className?: string }) {
  const [main, accent] = colours[id]
  return (
    <svg className={className} width="112" height="96" viewBox="0 0 120 100" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="89" rx="34" ry="5" fill="#14282A" opacity=".09" />
      {id === 'turtle' && <>
        <path d="M24 66 10 76l19 3m62-13 17 10-18 3M37 78l-3 12m47-12 4 12" fill={accent} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="58" cy="55" rx="35" ry="28" fill={main} stroke="#14282A" strokeWidth="3" />
        <path d="m58 29 14 16-5 24H46l-6-24 18-16Zm-18 16-14 10 20 14m26-24 16 10-21 14" stroke="#14282A" strokeWidth="2.5" />
        <circle cx="96" cy="54" r="15" fill={accent} stroke="#14282A" strokeWidth="3" />
        <circle cx="101" cy="50" r="2.5" fill="#14282A" /><path d="M102 60q-5 4-9 0" stroke="#14282A" strokeWidth="2" strokeLinecap="round" />
      </>}
      {id === 'crab' && <>
        <path d="m32 64-18 10m23-3-10 15m60-22 17 10m-22-3 11 15" stroke="#14282A" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 50C2 52 5 25 17 25c0 9 14 5 15 15m64 10c22 2 19-25 7-25 0 9-14 5-15 15" fill={main} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <path d="M46 42V29m28 13V29" stroke="#14282A" strokeWidth="3" />
        <ellipse cx="60" cy="63" rx="34" ry="23" fill={main} stroke="#14282A" strokeWidth="3" />
        <circle cx="46" cy="29" r="7" fill={accent} stroke="#14282A" strokeWidth="3" /><circle cx="74" cy="29" r="7" fill={accent} stroke="#14282A" strokeWidth="3" />
        <circle cx="46" cy="29" r="2" fill="#14282A" /><circle cx="74" cy="29" r="2" fill="#14282A" />
        <path d="M51 63q9 10 18 0" stroke="#14282A" strokeWidth="3" strokeLinecap="round" />
      </>}
      {id === 'otter' && <>
        <path d="M81 78q29 6 22-12" stroke="#14282A" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="60" cy="69" rx="28" ry="22" fill={main} stroke="#14282A" strokeWidth="3" />
        <circle cx="35" cy="32" r="12" fill={main} stroke="#14282A" strokeWidth="3" /><circle cx="85" cy="32" r="12" fill={main} stroke="#14282A" strokeWidth="3" />
        <circle cx="60" cy="45" r="33" fill={main} stroke="#14282A" strokeWidth="3" />
        <ellipse cx="60" cy="56" rx="22" ry="17" fill={accent} />
        <circle cx="47" cy="41" r="3" fill="#14282A" /><circle cx="73" cy="41" r="3" fill="#14282A" />
        <path d="M54 53q6-5 12 0-1 8-6 8t-6-8Zm6 12v4m-18-12-18-3m18 9-18 4m54-10 18-3m-18 9 18 4" stroke="#14282A" strokeWidth="2.5" strokeLinecap="round" />
      </>}
      {id === 'parrot' && <>
        <path d="m48 70-9 25 21-17 17 17-6-28" fill={accent} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="58" cy="59" rx="28" ry="31" fill={main} stroke="#14282A" strokeWidth="3" />
        <circle cx="61" cy="32" r="24" fill={main} stroke="#14282A" strokeWidth="3" />
        <path d="M78 27q31-1 14 24l-17-5" fill={accent} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <path d="M45 55q-26 1-14 27l26-17" fill="#2F9E68" stroke="#14282A" strokeWidth="3" />
        <circle cx="65" cy="29" r="8" fill="#FFFBF2" /><circle cx="67" cy="29" r="3" fill="#14282A" />
      </>}
      {id === 'gecko' && <>
        <path d="M38 75Q1 98 9 61q3-13 16-8" fill={main} stroke="#14282A" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="60" cy="66" rx="23" ry="27" fill={main} stroke="#14282A" strokeWidth="3" />
        <path d="m44 64-20 8m20 4L31 89m45-25 20 8M76 76l13 13" stroke="#14282A" strokeWidth="7" strokeLinecap="round" />
        <path d="M32 32Q28 6 43 19q17-13 34 0 15-13 11 13l-6 24H38Z" fill={main} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="46" cy="33" r="9" fill={accent} /><circle cx="75" cy="33" r="9" fill={accent} />
        <circle cx="46" cy="33" r="3" fill="#14282A" /><circle cx="75" cy="33" r="3" fill="#14282A" />
        <path d="M51 46q10 8 19 0" stroke="#14282A" strokeWidth="2.5" strokeLinecap="round" />
      </>}
      {id === 'puffin' && <>
        <path d="m47 84-11 9h22m15-9 11 9H63" stroke="#14282A" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="59" cy="62" rx="28" ry="29" fill={main} stroke="#14282A" strokeWidth="3" />
        <ellipse cx="59" cy="67" rx="19" ry="21" fill="#FFFBF2" />
        <circle cx="61" cy="33" r="25" fill={main} stroke="#14282A" strokeWidth="3" />
        <path d="M42 23q-3 20 11 22l7-21m17 0q4 19-10 21" fill="#FFFBF2" />
        <path d="m76 32 30 10-28 14q9-14-2-24" fill={accent} stroke="#14282A" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="49" cy="31" r="3" fill="#14282A" /><circle cx="69" cy="31" r="3" fill="#14282A" />
      </>}
    </svg>
  )
}
