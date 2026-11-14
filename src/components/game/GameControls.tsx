import { Circle, Lightbulb, Volume2, Waves } from 'lucide-react'
import { Button } from '../ui/button'
import { canUse, type PowerUpKind } from '../../lib/powerups'
import { useGameStore } from '../../store/gameStore'

const noUses = {}
export function GameControls({ stageId, hintVisible, onHint, onEcho, onCoconut, coconutAvailable, onTide, tideAvailable, disabled }: {
  stageId: number
  hintVisible: boolean
  onHint: () => void
  onEcho: () => void
  onCoconut: () => void
  coconutAvailable: boolean
  onTide: () => void
  tideAvailable: boolean
  disabled: boolean
}) {
  const inventory = useGameStore((state) => state.powerUps)
  const uses = useGameStore((state) => state.powerUpUses[stageId] ?? noUses)
  const spendPowerUp = useGameStore((state) => state.spendPowerUp)
  const power = (kind: PowerUpKind, action: () => void) => {
    if (spendPowerUp({ kind, stageId })) action()
  }
  return <>
    <div className="relative">
      <Button variant="quiet" size="icon" onClick={onHint} disabled={hintVisible || disabled} aria-label="Show hint" title="Hint"><Lightbulb /></Button>
      {hintVisible && <span className="sr-only">Hint shown</span>}
    </div>
    <div className="flex gap-1" role="group" aria-label="Power-ups">
      <Button variant="quiet" size="icon" disabled={disabled || !canUse('echo', uses, inventory)} onClick={() => power('echo', onEcho)} aria-label={`Echo power-up, ${uses.echo ?? 0} of 2 used`} title="Echo: hear the prompt"><Volume2 /><span className="sr-only">Echo</span></Button>
      <Button variant="quiet" size="icon" disabled={disabled || !coconutAvailable || !canUse('coconut', uses, inventory)} onClick={() => power('coconut', onCoconut)} aria-label={`Coconut power-up, ${uses.coconut ?? 0} of 2 used`} title="Coconut: remove two wrong answers"><Circle className="fill-gold-500" /><span className="sr-only">Coconut</span></Button>
      <Button variant="quiet" size="icon" disabled={disabled || !tideAvailable || !canUse('tide', uses, inventory)} onClick={() => power('tide', onTide)} aria-label={`Tide power-up, ${uses.tide ?? 0} of 2 used`} title="Tide: add five seconds"><Waves /><span className="sr-only">Tide</span></Button>
    </div>
  </>
}
