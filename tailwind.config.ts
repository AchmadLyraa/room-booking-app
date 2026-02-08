import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      // Warna PLN dan tema 
      colors: {
        pln: {
          green: '#22c55e',
          yellow: '#fff000',
        },
        primary: {
          50: '#22c55e',
          100: '#22c55e',
          foreground: '#ffffff',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#f5f5f5',
          foreground: '#000000',
        },
        accent: {
          50: '#22c55e',
          100: '#22c55e',
          foreground: '#ffffff',
        },
        destructive: {
          50: '#ff5e5b',
          100: '#ff5e5b',
          foreground: '#ffffff',
        },
        muted: {
          50: '#f5f5f5',
          100: '#f5f5f5',
          foreground: '#666666',
        },
        border: '#000000',
        input: '#000000',
        ring: '#000000',
        background: '#ffffff',
        foreground: '#000000',
        card: '#ffffff',
        popover: '#ffffff',
        sidebar: '#ffffff',
        'sidebar-foreground': '#000000',
        'sidebar-primary': '#22c55e',
        'sidebar-primary-foreground': '#ffffff',
        'sidebar-accent': '#f5f5f5',
        'sidebar-accent-foreground': '#000000',
        'sidebar-border': '#000000',
        'sidebar-ring': '#000000',
      },
      
      // Font khusus 
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      
      // Shadow neobrutal
      boxShadow: {
        'neobrutal': '4px 4px 0px #000000',
        'neobrutal-lg': '8px 8px 0px #000000',
        'neobrutal-hover': '6px 6px 0px #000000',
      },
      
      // Border width custom 
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      
      // Radius tajam (neobrutalism)
      borderRadius: {
        'neobrutal': '0px',
        'none': '0px',
        'sm': '0px',
        'md': '0px',
        'lg': '0px',
        'xl': '0px',
      },
      
      // Chart colors 
      chart: {
        1: '#22c55e',
        2: '#fff000',
        3: '#ff5e5b',
        4: '#3b82f6',
        5: '#a855f7',
      },
    },
  },
  plugins: [],
  experimental: {
    applyComplexClasses: true,
  },
}

export default config
