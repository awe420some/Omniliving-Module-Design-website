import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        omni: {
          forest: 'var(--omni-forest)',
          'forest-deep': 'var(--omni-forest-deep)',
          'forest-soft': 'var(--omni-forest-soft)',
          cream: 'var(--omni-cream)',
          'cream-soft': 'var(--omni-cream-soft)',
          'cream-deep': 'var(--omni-cream-deep)',
          paper: 'var(--omni-paper)',
          'paper-deep': 'var(--omni-paper-deep)',
          'paper-soft': 'var(--omni-paper-soft)',
          mint: 'var(--omni-mint)',
          'mint-soft': 'var(--omni-mint-soft)',
          'mint-deep': 'var(--omni-mint-deep)',
          ink: 'var(--omni-ink)',
          'ink-2': 'var(--omni-ink-2)',
          'ink-3': 'var(--omni-ink-3)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '4px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        full: '999px',
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        'omni': '1320px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
