/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{mjs,js,jsx,ts,tsx}", // Ensure your components are scanned
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        menubar: {
          light: '#2B195E', // increased value of dark version
          dark: '#483F60',  // darker version of games color
        },
        popover: {
          light: '#f3f4f6',
          dark: '#1f2937',
        },
        accent: {
          light: '#3b82f6',
          dark: '#2563eb',
        },
        background: {
          light: '#FFFFFF', // White
          dark : '#0f172a' // Slate-900
        },
        text: {
          light: '#64748b', // Slate-500
          dark : '#94a3b9' // Slate-400
        }
      }
    },
  },
  plugins: [],
};


