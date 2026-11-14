import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Tailwind v4 loads breakpoints from @theme in src/index.css (CSS-first);
      // this mirrors them so any tooling reading a JS config stays in sync.
      screens: {
        xs: '0px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1600px',
      },
      colors: {
        'ocean-900': '#0B3D3B',
        'ocean-700': '#12726E',
        parchment: '#FFFBF2',
        sand: '#F4E7D3',
        ink: '#14282A',
        'ink-muted': '#4A5A5B',
        'coral-600': '#C7421C',
        'gold-500': '#F5B33C',
        'leaf-600': '#2F9E68',
        'danger-600': '#B3392F',
        'sky-300': '#8ED0E0',
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
} satisfies Config
