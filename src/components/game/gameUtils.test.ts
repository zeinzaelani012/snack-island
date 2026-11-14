import { describe, expect, it } from 'vitest'
import { items } from '../../data/items'
import { completeAnswer, correctValues, followUpFor, isCorrectAnswer, itemOptions, timeForDifficulty } from './gameUtils'

describe('game answers', () => {
  it('renders every item type with the supplied answer by value', () => {
    expect(new Set(items.map((entry) => entry.type)).size).toBe(16)
    for (const entry of items) {
      expect(itemOptions(entry, () => .5)).toHaveLength(entry.options.length)
      expect(correctValues(entry)).toContain(entry.correct)
      expect(isCorrectAnswer(entry, entry.multiSelect ? entry.recognised!.slice(0, 3) : [entry.correct])).toBe(true)
    }
  })

  it('keeps category buckets ordered and shuffles reading choices once by value', () => {
    expect(itemOptions(items.find((entry) => entry.id === 's3-01')!, () => .99)).toEqual(['fruit', 'vegetables', 'snacks', 'drinks', 'meals'])
    expect(itemOptions(items.find((entry) => entry.id === 's8-01')!, () => 0)).toEqual(['fruit', 'breakfast', 'snack', 'water', 'garden', 'tree', 'sun', 'farmers', 'apples'])
  })

  it('accepts any three recognised words, not a prescribed combination', () => {
    const reading = items.find((entry) => entry.id === 's8-01')!
    expect(isCorrectAnswer(reading, ['snack', 'breakfast', 'fruit'])).toBe(true)
    expect(isCorrectAnswer(reading, ['apples', 'tree', 'fruit'])).toBe(false)
    expect(isCorrectAnswer(reading, ['apples', 'fruit'])).toBe(false)
  })

  it('always accepts a personal answer and creates complete feedback', () => {
    const personal = items.find((entry) => entry.id === 's8-05')!
    expect(isCorrectAnswer(personal, [personal.options[1]])).toBe(true)
    expect(completeAnswer(items.find((entry) => entry.id === 's4-10')!)).toBe('She likes rice.')
    expect(completeAnswer(items.find((entry) => entry.id === 's5-01')!)).toBe('I like chocolate because it is sweet.')
    expect(followUpFor(items.find((entry) => entry.id === 's3-05')!)?.options).toEqual(['It is a drink.', 'It is a snack.'])
  })

  it('uses exact difficulty times', () => {
    expect(timeForDifficulty('medium')).toBeNull()
    expect(timeForDifficulty('hard')).toBe(20)
    expect(timeForDifficulty('legend')).toBe(10)
  })
})
