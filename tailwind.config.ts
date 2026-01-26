import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        morph: {
          '0%': { borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%', transform: 'rotate(0deg) scale(1)' },
          '33%': { borderRadius: '70% 30% 50% 50% / 30% 30% 70% 70%', transform: 'rotate(120deg) scale(1.1)' },
          '66%': { borderRadius: '100% 60% 60% 100% / 100% 100% 60% 60%', transform: 'rotate(240deg) scale(0.9)' },
          '100%': { borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%', transform: 'rotate(360deg) scale(1)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'liquid-fill': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        },
        'infinity-trace': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'face-assemble': {
          '0%': { transform: 'translate(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0)) scale(0)', opacity: '0' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 2s linear infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        wave: 'wave 1.5s ease-in-out infinite',
        morph: 'morph 4s linear infinite',
        glitch: 'glitch 0.5s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 2s linear infinite',
        'liquid-fill': 'liquid-fill 3s ease-in-out infinite',
        'infinity-trace': 'infinity-trace 3s linear infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
        'face-assemble': 'face-assemble 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
export default config

