/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:"#FBFDFF",
        body: '#39496A',
        muted: '#6D727C',
        link: '#1C7CD6',
        'code-primary': '#657B83',
        'code-secondary': '#6078A9',
        // Background colors from reference image
        'hunk-bg': '#F8FBFF',
        'diff-add-bg': '#D8FFCB',
        'diff-del-bg': '#FFE4E9',
        'diff-border': '#E7F8F1',
      },
      fontFamily: {
        arial: ['Arial', 'sans-serif'],
        courier: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
