import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neobrutalism Color Palette
        primary: {
          50: '#000000',
          100: '#000000',
        },
        secondary: {
          50: '#FFFFFF',
          100: '#FFFFFF',
        },
        accent: {
          50: '#FF5E5B',
          100: '#FF5E5B',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
      boxShadow: {
        'neobrutal': '8px 8px 0px #000000',
        'neobrutal-sm': '4px 4px 0px #000000',
        'neobrutal-lg': '12px 12px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      borderRadius: {
        'neobrutal': '12px',
      },
    },
  },
  plugins: [],
  experimental: {
    applyComplexClasses: true,
  },
}
export default config
