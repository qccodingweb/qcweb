/** @type {import('tailwindcss').Config} */
// Static build replacing the cdn.tailwindcss.com runtime.
// Rebuild after changing utility classes in HTML/JS:
//   npx tailwindcss@3 -i ./tailwind.input.css -o ./css/tailwind.css --minify
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#040f0f', 900: '#061d1d', 850: '#082525', 800: '#0a2e2e', 700: '#0e3a37' },
        mint: { 300: '#6df5c8', 400: '#3df0b5', 500: '#14e89c', 600: '#0bc787', 700: '#0a9a6b' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
