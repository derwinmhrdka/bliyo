import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'green-dark': '#0e3d23',
        'green-mid': '#1a6b3f',
        'green-accent': '#1f8a4c',
        'green-soft': '#e7f3ec',
        wave: '#155c33',
        ink: '#16241c',
        mute: '#5c6b62',
        line: '#dfe8e2',
        danger: '#9f2d2d',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        control: '9px',
      },
    },
  },
  plugins: [],
};

export default config;
