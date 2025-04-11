/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
        },
        cream: {
          light: 'var(--color-cream-light)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        script: ['"Dancing Script"', 'cursive'],
        // ELIMINADO: Definición de 'rouge' ya no necesaria
        // rouge: ['"Tangerine"', 'cursive'], 
      },
    },
  },
  plugins: [],
} 