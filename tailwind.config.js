/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 根据 Figma 设计稿
        primary: {
          50: '#E8F3FF',   // 浅蓝背景
          100: '#BEDAFF',  // 边框蓝
          200: '#9BC5FF',
          300: '#78B0FF',
          400: '#4080FF',  // Figma 主蓝色
          500: '#1D5CFF',  // 深蓝色按钮
          600: '#1650E0',
          700: '#1044C2',
          800: '#0A38A4',
          900: '#052C86',
        },
        // 文字颜色 - Figma 精确值
        text: {
          primary: '#000000',   // 主文字黑色
          secondary: '#4E5969', // 次要文字灰色
          muted: '#86909C',     // 辅助文字
        },
        // 背景色
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F5F6', // 侧边栏背景
          tertiary: '#F4F5F7',
        },
        // 边框
        border: {
          DEFAULT: '#E5E6EB',
          light: '#F4F5F7',
        },
        // 渐变相关
        accent: {
          purple: '#9863FB',
          pink: '#E14292',
          orange: '#FBB81C',
          blue: '#006AEB',
        }
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        // 根据 Figma 字体规范
        '10': ['10px', { lineHeight: '1.4' }],
        '11': ['11px', { lineHeight: '1.4' }],
        '12': ['12px', { lineHeight: '1.4' }],
        '13': ['13px', { lineHeight: '1.4' }],
        '14': ['14px', { lineHeight: '1.4' }],
        '15': ['15px', { lineHeight: '1.4' }],
        '16': ['16px', { lineHeight: '1.4' }],
        '38': ['38px', { lineHeight: '1.4' }],
      },
      spacing: {
        '15': '15px',
        '18': '18px',
        '20': '20px',
        '24': '24px',
        '40': '40px',
        '280': '280px',
        '770': '770px',
      },
      boxShadow: {
        // Figma 阴影
        'sidebar-item': '0px 1px 3px 0px rgba(25, 33, 61, 0.1)',
        'input': '0px 5px 30px 0px rgba(41, 14, 0, 0.05)',
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '10': '10px',
        '14': '14px',
        '16': '16px',
        '20': '20px',
        '28': '28px',
        'full': '100px',
      },
      width: {
        '280': '280px',
        '770': '770px',
      },
      height: {
        '32': '32px',
        '34': '34px',
        '36': '36px',
        '40': '40px',
        '70': '70px',
        '140': '140px',
      },
      maxWidth: {
        '770': '770px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
