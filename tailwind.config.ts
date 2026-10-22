import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'luminary-deep': 'var(--base-deep)',
        'luminary-mid': 'var(--base-mid)',
        'luminary-soft': 'var(--base-soft)',
        'luminary-slate-warm': 'var(--slate-warm)',
        'luminary-slate-light': 'var(--slate-light)',
        'luminary-graphite': 'var(--graphite)',
        'luminary-graphite-soft': 'var(--graphite-soft)',
        'luminary-ivory': 'var(--ivory)',
        'luminary-silver': 'var(--silver)',
        'luminary-panel': 'var(--panel-bg)',
        'luminary-border': 'var(--panel-border)'
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      boxShadow: {
        'luminary-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'luminary-silver': '0 4px 24px rgba(176, 184, 196, 0.15)'
      }
    }
  },
  plugins: []
};

export default config;
