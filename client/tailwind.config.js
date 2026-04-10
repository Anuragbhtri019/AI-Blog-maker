/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2.75rem', { lineHeight: '1.1' }],
        'article-base': ['1.125rem', { lineHeight: '1.75' }],
      },
      borderRadius: {
        card: '1rem',
        feature: '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-hover': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
      spacing: {
        reading: '56rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
