/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        dark: '#0f172a',
        void: '#020817',
        cyber: '#06b6d4',
        'cyber-purple': '#8b5cf6',
        'cyber-green': '#10b981',
      },
      animation: {
        'glow': 'glow 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.7), 0 0 60px rgba(6, 182, 212, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
