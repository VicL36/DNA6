/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors - mais escuros
        'dark-bg': '#0a0a0f',
        'dark-surface': '#1a1a2e',
        'dark-elevated': '#16213e',
        'metallic': '#2d3748',
        'metallic-light': '#4a5568',
        
        // Neon colors - tons mais escuros baseados nas referências
        'neon-orange': '#d4621a', // Tom mais escuro de laranja
        'neon-blue': '#1a5f7a',   // Tom mais escuro de azul
        
        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#a0aec0',
        'text-muted': '#718096',
        
        // Custom color palette
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#d4621a', // Laranja mais escuro
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#1a5f7a', // Azul mais escuro
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-pattern': `
          radial-gradient(circle at 20% 80%, rgba(212, 98, 26, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(26, 95, 122, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(212, 98, 26, 0.05) 0%, transparent 50%)
        `,
      },
      animation: {
        'gradient-shift': 'gradientShift 4s ease infinite',
        'pulse-orange': 'pulseOrange 2s infinite',
        'pulse-blue': 'pulseBlue 2s infinite',
        'neural-pulse': 'neuralPulse 8s ease-in-out infinite',
        'audio-wave': 'audioWave 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 98, 26, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 98, 26, 0.6)' },
        },
        pulseBlue: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(26, 95, 122, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(26, 95, 122, 0.6)' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        audioWave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px rgba(212, 98, 26, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(26, 95, 122, 0.8)' },
        },
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(212, 98, 26, 0.3)',
        'neon-blue': '0 0 20px rgba(26, 95, 122, 0.3)',
        'neon-orange-lg': '0 0 40px rgba(212, 98, 26, 0.4)',
        'neon-blue-lg': '0 0 40px rgba(26, 95, 122, 0.4)',
        'metallic': '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};