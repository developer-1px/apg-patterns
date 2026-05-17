import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class', ':where(.dark, [data-theme="dark"])'],
  content: ['./demo/**/*.{html,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
