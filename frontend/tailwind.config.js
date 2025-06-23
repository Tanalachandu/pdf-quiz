// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'bg-light-blue': '#E0F2F7', // Very light blue background
          'card-white': '#FFFFFF',    // White cards
          'text-dark': '#2D3748',     // Dark gray text for contrast
          'primary-blue': '#3B82F6',  // A vibrant blue
          'primary-purple': '#8B5CF6', // A vibrant purple
          'accent-green': '#10B981',  // A bright green for success/highlight
          'accent-orange': '#F59E0B', // A lively orange
          'border-light': '#E2E8F0',  // Light border for separation
          'error-red': '#EF4444',     // Standard red for errors
        },
        boxShadow: {
          'card-shadow': '0 4px 12px rgba(0, 0, 0, 0.08)', // Soft shadow for cards
          'button-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)', // Slightly stronger for buttons
        },
        animation: {
          'pop-in': 'popIn 0.4s ease-out forwards',
          'wiggle': 'wiggle 1s ease-in-out infinite',
        },
        keyframes: {
          popIn: {
            '0%': { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
            '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          },
          wiggle: {
            '0%, 100%': { transform: 'rotate(-3deg)' },
            '50%': { transform: 'rotate(3deg)' },
          }
        }
      },
    },
    plugins: [],
  };