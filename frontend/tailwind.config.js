export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Satoshi', 'sans-serif'],
        display: ['General Sans', 'sans-serif'],
      },
      colors: {
        basebg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        textmain: 'var(--text)',
        textmuted: 'var(--muted)',
        primary: 'var(--primary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        borderc: 'var(--border)'
      },
      boxShadow: {
        soft: 'var(--shadow)'
      },
      borderRadius: {
        panel: '1rem'
      }
    },
  },
  plugins: [],
}
