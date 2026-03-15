// Author: Jeremy Quadri
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0D0D12',
        // DevSecure accent: security green replaces champagne gold on the page level.
        // The chat component (AIConcierge) retains its own #F4E8D1 hardcoded hex.
        champagne: '#4ADE80',
        obsidianLight: '#1A1A24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
