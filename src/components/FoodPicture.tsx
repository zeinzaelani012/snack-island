import { useState } from 'react'

export function FoodPicture({ word, image, className = '' }: { word: string; image: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const id = image.split('/').pop()?.replace(/\.(png|svg)$/, '') ?? word
  if (failed) return <span className="font-display text-6xl text-gold-500" role="img" aria-label={word}>●</span>
  return <img className={`${className} size-full object-contain`} src={`/img/food/${id}.svg`} alt={word} draggable={false} onError={() => setFailed(true)} />
}
