/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          core:   '#4cdd1e',
          deep:   '#2aab00',
          subtle: '#d6f5cb',
          glow:   'rgba(76,221,30,0.25)',
        },
        black: {
          spore: '#0d1a0d',
          ink:   '#1a2e1a',
          mist:  'rgba(13,26,13,0.08)',
        },
        bg: {
          primary:   '#f4f9f4',
          secondary: '#eaf3ea',
          glass:     'rgba(255,255,255,0.72)',
        },
        text: {
          primary:   '#0d1a0d',
          secondary: '#3a5a3a',
          muted:     '#7a9a7a',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm:   '10px',
        md:   '18px',
        lg:   '28px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(13,26,13,0.08), 0 1px 4px rgba(76,221,30,0.10)',
        glow: '0 0 20px rgba(76,221,30,0.35)',
      },
      keyframes: {
        blobDrift: {
          '0%':   { borderRadius: '60% 40% 55% 45% / 45% 55% 40% 60%', transform: 'scale(1) rotate(0deg)' },
          '100%': { borderRadius: '40% 60% 45% 55% / 55% 45% 60% 40%', transform: 'scale(1.08) rotate(6deg)' },
        },
      },
      animation: {
        blob: 'blobDrift 8s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
