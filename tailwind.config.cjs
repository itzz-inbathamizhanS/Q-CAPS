// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // Force dark mode by default for cyber theme
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0f',
        'cyber-gray': '#1c1c24',
        'neon-green': '#00ff88',
        'neon-blue': '#00f0ff',
        'neon-purple': '#b000ff'
      },
      boxShadow: {
        'neon-green': '0 0 10px #00ff88, 0 0 20px #00ff88',
        'neon-blue': '0 0 10px #00f0ff, 0 0 20px #00f0ff'
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}