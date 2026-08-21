/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#060911',
          900: '#0b101d',
          850: '#111827',
          800: '#1a2337',
          750: '#232f48',
          700: '#2d3b59',
          border: '#1f2d48',
          card: '#0e1526',
          hover: '#162038'
        },
        gemini: {
          purple: '#9333ea',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          glow: '#818cf8'
        },
        clickhouse: {
          yellow: '#fbbf24',
          orange: '#f97316',
          bg: '#1c1917'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
};
