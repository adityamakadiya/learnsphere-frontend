/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',   // Indigo-600
        secondary: '#10B981', // Emerald-500
        accent: '#F59E0B',    // Amber-500
      },
      boxShadow: {
        'modern': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'modern': '0.75rem',
      },
    },
  },
  plugins: [],
}
