/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0D12',
        surface: '#111620',
        panel: '#161D29',
        ivory: '#EDEBE4',
        slateInk: '#9CA6B8',
        mutedInk: '#6C7689',
        brass: '#E5A94C',
        cobalt: '#38BDF8',
        emeraldScope: '#34D399',
        solarCoral: '#F9735B',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
