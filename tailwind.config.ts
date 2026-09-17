import type { Config } from 'tailwindcss';

/**
 * Satu-satunya sumber token visual (warna, radius, font, z-index) — lihat
 * Docs/CLAUDE.md §7. Tidak ada nilai warna/radius sembarang di JSX.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf0dd',
          200: '#b9e0bb',
          300: '#8fcb92',
          400: '#5fb066',
          500: '#3a9142',
          600: '#2c7433',
          700: '#245c2a',
          800: '#1f4a24',
          900: '#193c1e',
        },
        neutral: {
          50: '#fafafa',
          100: '#f2f2f0',
          200: '#e2e1de',
          300: '#c9c7c2',
          400: '#a3a099',
          500: '#79766e',
          600: '#5b5851',
          700: '#454239',
          800: '#2d2b26',
          900: '#1a1815',
        },
        danger: {
          50: '#fdf1f0',
          500: '#c1443a',
          600: '#a3372e',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      zIndex: {
        base: '0',
        header: '20',
        overlay: '30',
        dialog: '40',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
} satisfies Config;
