import type { Item } from '../../data/items'
import type { Difficulty } from '../../types'

export type AnswerStatus = 'correct' | 'wrong'
export type OptionStatus = AnswerStatus | 'selected' | 'removed' | 'idle'
export type GameResult = {
  item: Item
  attempt: number
  correct: boolean
  xp: number
  answer: string[]
}

export type FollowUp = { prompt: string; options: string[] }

export { readingPassage, readingParagraphs } from '../../data/reading'

export function timeForDifficulty(difficulty: Difficulty): number | null {
  return difficulty === 'hard' ? 20 : difficulty === 'legend' ? 10 : null
}

export function itemOptions(item: Item, random: () => number = Math.random): string[] {
  if (item.type === 'categorySort') return [...item.options]
  const options = [...item.options]
  for (let index = options.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[options[index], options[other]] = [options[other], options[index]]
  }
  return options
}

export function correctValues(item: Item): string[] {
  return item.multiSelect ? item.recognised ?? [item.correct] : [item.correct]
}

export function isCorrectAnswer(item: Item, answer: string[]): boolean {
  if (item.alwaysCorrect) return answer.length === 1
  if (item.multiSelect) {
    return answer.length === 3 && answer.every((value) => correctValues(item).includes(value))
  }
  return answer.length === 1 && answer[0] === item.correct
}

export function completeAnswer(item: Item, answer = item.correct): string {
  if (item.type === 'pictureToWord' || item.type === 'wordToPicture' || item.type === 'categorySort' || item.type === 'oddOneOut' || item.type === 'definitionMatch' || item.type === 'blendPick' || item.type === 'listenPick' || item.type === 'whatsMissing') return answer.split('/').pop()?.replace('.png', '') ?? answer
  if (item.type === 'thirdPersonFix' && item.stimulus?.includes('___')) return item.stimulus.replace('___', answer)
  if (item.type === 'reasonBuild') return `${item.stimulus ?? ''} ${answer}`.replace(' ___', '')
  return answer
}

export function followUpFor(item: Item): FollowUp | null {
  if (item.type === 'oddOneOut') {
    const drink = ['soda', 'milk'].includes(item.correct)
    return {
      prompt: 'Why?',
      options: drink ? ['It is a drink.', 'It is a snack.'] : ['It is a snack.', 'It is a meal.'],
    }
  }
  if (item.type === 'errorFix') {
    const fixes: Record<string, string[]> = {
      's4-07': ['likes → like', "like → don't like"],
      's4-08': ["no like → don't like", 'no like → likes'],
      's4-09': ["don't → doesn't", "don't → likes"],
    }
    return { prompt: 'What changed?', options: fixes[item.id] ?? ['The verb changed.', 'The food changed.'] }
  }
  return null
}
