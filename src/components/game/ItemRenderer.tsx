import { Volume2 } from 'lucide-react'
import type { Item } from '../../data/items'
import { readingParagraphs } from '../../data/reading'
import { FoodPicture } from '../FoodPicture'
import { Button } from '../ui/button'
import { OptionButton } from './OptionButton'
import type { OptionStatus } from './gameUtils'

export function Prompt({ item, replay }: { item: Item; replay: () => void }) {
  const audio = item.type === 'listenPick' || item.type === 'whatsMissing'
  return <div className="flex min-h-0 flex-col gap-[var(--sp-3)]">
    <h2 className="fs-body max-w-[var(--measure-instruction)] shrink-0 font-semibold leading-snug text-ocean-900">{item.prompt}</h2>
    {audio && <Button variant="secondary" size={item.type === 'listenPick' ? 'large' : 'default'} onClick={replay} aria-label="Replay audio" className="shrink-0 self-start"><Volume2 className={item.type === 'listenPick' ? 'size-8' : ''} /> Replay</Button>}
    {item.image && item.type !== 'oddOneOut' && <div className="flex h-[34dvh] max-h-[34dvh] w-full shrink-0 items-center justify-center gap-[var(--sp-3)]">
      <div className="h-full w-full"><FoodPicture word={item.stimulus ?? item.correct} image={item.image} /></div>
      {item.type === 'sentenceBuild' && <span className="text-5xl" role="img" aria-label={item.stimulus === '😋' ? 'Happy face' : 'No'}>{item.stimulus}</span>}
    </div>}
    {item.type === 'wordToPicture' && <p className="my-auto font-display text-5xl font-semibold text-ocean-900">{item.stimulus}</p>}
    {item.type === 'definitionMatch' && <p className="fs-h3 my-auto max-w-[var(--measure-instruction)] rounded-[var(--radius)] border-2 border-sand bg-sand/35 p-[var(--sp-4)] leading-relaxed">{item.stimulus}</p>}
    {['errorFix', 'thirdPersonFix', 'reasonBuild', 'agree', 'trueFalse', 'personal'].includes(item.type)
      && <p className="fs-h3 my-auto max-w-[var(--measure-instruction)] rounded-[var(--radius)] border-2 border-sand bg-sand/35 px-[var(--sp-4)] py-[var(--sp-3)] font-semibold leading-relaxed">{item.stimulus}</p>}
    {item.type === 'blendPick' && <span className="font-display text-6xl text-ocean-700">{item.prompt.match(/"([^"]+)"/)?.[1]}</span>}
    {item.type === 'whatsMissing' && <p className="my-auto font-display text-4xl font-semibold tracking-wide text-ocean-700" aria-label="One word is missing">?, ?, ?, <span className="text-coral-600">?</span></p>}
    {item.type === 'readTask' && <div className="max-h-[38dvh] w-full shrink-0 overflow-y-auto rounded-[var(--radius)] border-2 border-sand bg-sand/30 p-[var(--sp-4)] text-left" tabIndex={0} aria-label="Reading passage"><div className="fs-body max-w-[var(--measure-reading)] leading-[1.6]">{readingParagraphs.map((paragraph) => <p key={paragraph.slice(0, 16)}>{paragraph}</p>)}</div></div>}
    {item.type === 'categorySort' && <p className="fs-body shrink-0 text-ink-muted">Tap a group.</p>}
  </div>
}

export function ItemRenderer({ item, options, selected, statusFor, onSelect }: {
  item: Item
  options: string[]
  selected: string[]
  statusFor: (value: string) => OptionStatus
  onSelect: (value: string) => void
}) {
  const picture = item.type === 'wordToPicture' || item.type === 'oddOneOut' || item.type === 'listenPick'
  const grid = item.type === 'categorySort' ? 'grid-cols-3 content-center gap-[var(--sp-2)] md:grid-cols-5'
    : item.type === 'readTask' ? 'grid-cols-3 content-start gap-[var(--sp-2)] overflow-y-auto'
      : picture ? 'content-stretch grid-cols-2 gap-[var(--sp-3)] md:grid-cols-4'
        : 'grid-cols-1 content-start gap-[var(--sp-3)] overflow-y-auto'
  return <div className={`grid min-h-0 flex-1 ${grid}`} role="group" aria-label="Answer options">
    {options.map((value) => <OptionButton key={`${value}-${statusFor(value)}`} label={picture ? value.split('/').pop()?.replace('.png', '') ?? value : value}
      status={statusFor(value)} onClick={() => onSelect(value)} className={picture ? 'picture-option' : item.type === 'readTask' ? 'min-h-12 px-2' : item.type === 'categorySort' ? 'min-h-16 gap-0 overflow-visible border-0 bg-parchment p-0 text-center shadow-none hover:bg-parchment' : ''}>
      {picture ? <div className="min-h-0 w-full flex-1"><FoodPicture word={value.split('/').pop()?.replace('.png', '') ?? value} image={value.startsWith('/') ? value : `/img/food/${value}.png`} /></div>
        : item.type === 'categorySort' ? <div className="relative w-full">
          <img className="block w-full" src={`/img/crates/${value}.svg`} alt="" draggable={false} />
          <span className="fs-sm absolute top-[58%] left-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2 text-center font-display font-semibold leading-[1.15] hyphens-auto break-words text-ocean-900">{value}</span>
        </div> : value}
      {selected.includes(value) && item.multiSelect && <span className="sr-only">Selected</span>}
    </OptionButton>)}
  </div>
}
