/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Paleta Brand burdeos (vino)
        brand: {
          50: '#fcf5f7',
          100: '#f8e7ec',
          200: '#f1cbd6',
          300: '#e5a4b7',
          400: '#d46e8d',
          500: '#b8325b', // Color principal burdeos
          600: '#9d284d',
          700: '#7e1f3e',
          800: '#651a33',
          900: '#53172b',
          950: '#300a16',
        },
        // Estados para badges y notificaciones
        state: {
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            700: '#15803d',
            800: '#166534',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            700: '#d97706',
            800: '#92400e',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            700: '#dc2626',
            800: '#991b1b',
          },
          info: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            700: '#1d4ed8',
            800: '#1e40af',
          },
          neutral: {
            50: '#f9fafb',
            100: '#f3f4f6',
            500: '#6b7280',
            700: '#374151',
            800: '#1f2937',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0px 8px 24px rgba(0, 0, 0, 0.12)',
        'button': '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '16': '4rem',   // 64px - padding estándar
        '24': '6rem',   // 96px - padding grande
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      },
      minHeight: {
        'touch': '44px', // Tamaño mínimo táctil para accesibilidad
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
