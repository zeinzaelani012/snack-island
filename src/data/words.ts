// src/data/words.ts
// Vocabulary bank for Unit 1 "Snack Time": 16 food words with chunk,
// sort metadata, a simple-English reason clause and an image path.

export type SortBucket = 'fruit' | 'vegetables' | 'snacks' | 'drinks' | 'meals';

export interface Word {
  id: string;
  en: string;
  chunk: 1 | 2;
  groupWord: boolean; // true only for group words ('fruit' and 'vegetables')
  sortable: boolean; // false for group words
  sortBucket: SortBucket;
  reason: string;
  image: string;
}

export const words: Word[] = [
  {
    id: 'candy',
    en: 'candy',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'snacks',
    reason: 'it is sweet',
    image: '/img/food/candy.png',
  },
  {
    id: 'chocolate',
    en: 'chocolate',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'snacks',
    reason: 'it is sweet',
    image: '/img/food/chocolate.png',
  },
  {
    id: 'cookies',
    en: 'cookies',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'snacks',
    reason: 'they are crunchy',
    image: '/img/food/cookies.png',
  },
  {
    id: 'popcorn',
    en: 'popcorn',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'snacks',
    reason: 'it is crunchy',
    image: '/img/food/popcorn.png',
  },
  {
    id: 'fries',
    en: 'fries',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'snacks',
    reason: 'they are salty',
    image: '/img/food/fries.png',
  },
  {
    id: 'cereal',
    en: 'cereal',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'meals',
    reason: 'it is tasty',
    image: '/img/food/cereal.png',
  },
  {
    id: 'soda',
    en: 'soda',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'drinks',
    reason: 'it is fizzy',
    image: '/img/food/soda.png',
  },
  {
    id: 'milk',
    en: 'milk',
    chunk: 1,
    groupWord: false,
    sortable: true,
    sortBucket: 'drinks',
    reason: 'it is healthy',
    image: '/img/food/milk.png',
  },
  {
    id: 'apples',
    en: 'apples',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'fruit',
    reason: 'they are sweet',
    image: '/img/food/apples.png',
  },
  {
    id: 'bananas',
    en: 'bananas',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'fruit',
    reason: 'they are sweet',
    image: '/img/food/bananas.png',
  },
  {
    id: 'fruit',
    en: 'fruit',
    chunk: 2,
    groupWord: true,
    sortable: false,
    sortBucket: 'fruit',
    reason: 'it is healthy',
    image: '/img/food/fruit.png',
  },
  {
    id: 'vegetables',
    en: 'vegetables',
    chunk: 2,
    groupWord: true,
    sortable: false,
    sortBucket: 'vegetables',
    reason: 'they are healthy',
    image: '/img/food/vegetables.png',
  },
  {
    id: 'tomatoes',
    en: 'tomatoes',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'vegetables',
    reason: 'they are soft',
    image: '/img/food/tomatoes.png',
  },
  {
    id: 'rice',
    en: 'rice',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'meals',
    reason: 'it is tasty',
    image: '/img/food/rice.png',
  },
  {
    id: 'soup',
    en: 'soup',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'meals',
    reason: 'it is hot',
    image: '/img/food/soup.png',
  },
  {
    id: 'yogurt',
    en: 'yogurt',
    chunk: 2,
    groupWord: false,
    sortable: true,
    sortBucket: 'meals',
    reason: 'it is creamy',
    image: '/img/food/yogurt.png',
  },
];

export const sortBuckets: SortBucket[] = ['fruit', 'vegetables', 'snacks', 'drinks', 'meals'];
export const sortableWords = words.filter(w => w.sortable);
