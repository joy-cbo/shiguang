import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './themes/**/*.vue',
    './plugins/**/*.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
