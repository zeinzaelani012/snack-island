import type { Progress } from '../types'

export type PowerUpKind = keyof Progress['powerUps']
export type PowerUpInventory = Progress['powerUps']
export type StagePowerUpUses = Partial<Record<PowerUpKind, number>>

export const POWER_UP_USE_CAP = 2

export function canUse(
  kind: PowerUpKind,
  stageUses: StagePowerUpUses,
  inventory: PowerUpInventory,
): boolean {
  return inventory[kind] > 0 && (stageUses[kind] ?? 0) < POWER_UP_USE_CAP
}

export function spend(
  inventory: PowerUpInventory,
  kind: PowerUpKind,
): PowerUpInventory {
  return { ...inventory, [kind]: Math.max(0, inventory[kind] - 1) }
}
