// tailwind.config.cjs
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Original Q-CAPS cyber theme
        'cyber-black': '#0a0a0f',
        'cyber-gray': '#1c1c24',
        'neon-green': '#00ff88',
        'neon-blue': '#00f0ff',
        'neon-purple': '#b000ff',

        // Stitch design system tokens
        'on-surface-variant': '#d3c0d8',
        'surface-container-lowest': '#0e0e13',
        'surface': '#131318',
        'on-surface': '#e4e1e9',
        'on-primary-container': '#fff3ff',
        'surface-container-highest': '#35343a',
        'on-error': '#690005',
        'tertiary-container': '#008242',
        'secondary-container': '#00eefc',
        'surface-container-low': '#1b1b20',
        'on-primary': '#4f0076',
        'primary': '#e6b4ff',
        'primary-container': '#b000ff',
        'tertiary-fixed': '#60ff99',
        'outline-variant': '#4f4255',
        'inverse-primary': '#9400d8',
        'surface-container': '#1f1f25',
        'background': '#131318',
        'surface-bright': '#39383e',
        'tertiary': '#00e479',
        'on-tertiary': '#003919',
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'outline': '#9c8ba1',
        'surface-container-high': '#2a292f',
        'surface-variant': '#35343a',
        'secondary': '#d3fbff',
        'accent-cyan': '#00eefc',
        'accent-coral': '#ffb4ab',
      },
      boxShadow: {
        'neon-green': '0 0 10px #00ff88, 0 0 20px #00ff88',
        'neon-blue': '0 0 10px #00f0ff, 0 0 20px #00f0ff'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        sm: '16px',
        xl: '48px',
        lg: '32px',
        base: '4px',
        md: '24px',
        'container-max': '1440px',
        xs: '8px',
        gutter: '20px'
      },
      fontFamily: {
        'label-caps': ['JetBrains Mono', 'monospace'],
        'headline-md': ['Inter', 'sans-serif'],
        'headline-sm': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'data-mono': ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'label-caps': ['12px', { lineHeight: '1', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'data-mono': ['14px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }]
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-opacity': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'blink-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'pulse-slow': 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink-cursor 1s step-end infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}