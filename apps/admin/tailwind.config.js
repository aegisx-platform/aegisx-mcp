const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: ['selector', '.dark'],
  important: true,
  theme: {
    fontSize: {
      xs: '0.625rem',
      sm: '0.75rem',
      md: '0.8125rem',
      base: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      '4xl': '2rem',
      '5xl': '2.25rem',
      '6xl': '2.5rem',
      '7xl': '3rem',
      '8xl': '4rem',
      '9xl': '6rem',
      '10xl': '8rem',
    },
    screens: {
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1440px',
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        // Material Angular colors (keep for compatibility)
        primary: {
          ...colors.indigo,
          DEFAULT: colors.indigo[600],
        },
        accent: {
          ...colors.slate,
          DEFAULT: colors.slate[800],
        },
        warn: {
          ...colors.red,
          DEFAULT: colors.red[600],
        },
        'on-warn': {
          500: colors.red['50'],
        },
        gray: colors.slate,

        // AegisX Design Tokens → Tailwind Classes
        // Now you can use: text-brand, bg-brand-faint, border-brand-muted, etc.

        // Brand/Primary Colors
        brand: {
          faint: 'var(--aegisx-brand-faint)',
          muted: 'var(--aegisx-brand-muted)',
          subtle: 'var(--aegisx-brand-subtle)',
          DEFAULT: 'var(--aegisx-brand-default)',
          emphasis: 'var(--aegisx-brand-emphasis)',
          strong: 'var(--aegisx-brand-strong)',
          inverted: 'var(--aegisx-brand-inverted)',
        },

        // Success Colors
        success: {
          faint: 'var(--aegisx-success-faint)',
          muted: 'var(--aegisx-success-muted)',
          subtle: 'var(--aegisx-success-subtle)',
          DEFAULT: 'var(--aegisx-success-default)',
          emphasis: 'var(--aegisx-success-emphasis)',
          inverted: 'var(--aegisx-success-inverted)',
        },

        // Warning Colors
        warning: {
          faint: 'var(--aegisx-warning-faint)',
          muted: 'var(--aegisx-warning-muted)',
          subtle: 'var(--aegisx-warning-subtle)',
          DEFAULT: 'var(--aegisx-warning-default)',
          emphasis: 'var(--aegisx-warning-emphasis)',
          inverted: 'var(--aegisx-warning-inverted)',
        },

        // Error/Danger Colors
        error: {
          faint: 'var(--aegisx-error-faint)',
          muted: 'var(--aegisx-error-muted)',
          subtle: 'var(--aegisx-error-subtle)',
          DEFAULT: 'var(--aegisx-error-default)',
          emphasis: 'var(--aegisx-error-emphasis)',
          inverted: 'var(--aegisx-error-inverted)',
        },

        // Info Colors
        info: {
          faint: 'var(--aegisx-info-faint)',
          muted: 'var(--aegisx-info-muted)',
          subtle: 'var(--aegisx-info-subtle)',
          DEFAULT: 'var(--aegisx-info-default)',
          emphasis: 'var(--aegisx-info-emphasis)',
          inverted: 'var(--aegisx-info-inverted)',
        },

        // Cyan Colors
        cyan: {
          faint: 'var(--aegisx-cyan-faint)',
          muted: 'var(--aegisx-cyan-muted)',
          subtle: 'var(--aegisx-cyan-subtle)',
          DEFAULT: 'var(--aegisx-cyan-default)',
          emphasis: 'var(--aegisx-cyan-emphasis)',
          inverted: 'var(--aegisx-cyan-inverted)',
        },

        // Purple Colors
        purple: {
          faint: 'var(--aegisx-purple-faint)',
          muted: 'var(--aegisx-purple-muted)',
          subtle: 'var(--aegisx-purple-subtle)',
          DEFAULT: 'var(--aegisx-purple-default)',
          emphasis: 'var(--aegisx-purple-emphasis)',
          inverted: 'var(--aegisx-purple-inverted)',
        },

        // Indigo Colors
        indigo: {
          faint: 'var(--aegisx-indigo-faint)',
          muted: 'var(--aegisx-indigo-muted)',
          subtle: 'var(--aegisx-indigo-subtle)',
          DEFAULT: 'var(--aegisx-indigo-default)',
          emphasis: 'var(--aegisx-indigo-emphasis)',
          inverted: 'var(--aegisx-indigo-inverted)',
        },

        // Pink Colors
        pink: {
          faint: 'var(--aegisx-pink-faint)',
          muted: 'var(--aegisx-pink-muted)',
          subtle: 'var(--aegisx-pink-subtle)',
          DEFAULT: 'var(--aegisx-pink-default)',
          emphasis: 'var(--aegisx-pink-emphasis)',
          inverted: 'var(--aegisx-pink-inverted)',
        },

        // Background Colors
        background: {
          muted: 'var(--aegisx-background-muted)',
          subtle: 'var(--aegisx-background-subtle)',
          DEFAULT: 'var(--aegisx-background-default)',
          emphasis: 'var(--aegisx-background-emphasis)',
        },

        // Text Colors
        text: {
          disabled: 'var(--aegisx-text-disabled)',
          subtle: 'var(--aegisx-text-subtle)',
          secondary: 'var(--aegisx-text-secondary)',
          primary: 'var(--aegisx-text-primary)',
          heading: 'var(--aegisx-text-heading)',
          inverted: 'var(--aegisx-text-inverted)',
        },

        // Border Colors
        border: {
          muted: 'var(--aegisx-border-muted)',
          DEFAULT: 'var(--aegisx-border-default)',
          emphasis: 'var(--aegisx-border-emphasis)',
        },

        // Legacy Fuse colors (keep for backwards compatibility)
        card: 'var(--fuse-bg-card)',
        'card-foreground': 'var(--fuse-text-default)',
        default: 'var(--fuse-bg-default)',
        secondary: 'var(--fuse-text-secondary)',
        hint: 'var(--fuse-text-hint)',
        disabled: 'var(--fuse-text-disabled)',
        hover: 'var(--fuse-hover)',
        divider: 'var(--fuse-divider)',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      opacity: {
        12: '0.12',
        38: '0.38',
        87: '0.87',
      },
      rotate: {
        '-270': '270deg',
        15: '15deg',
        30: '30deg',
        60: '60deg',
        270: '270deg',
      },
      scale: {
        '-1': '-1',
      },
      zIndex: {
        '-1': -1,
        49: 49,
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        99: 99,
        999: 999,
        9999: 9999,
        99999: 99999,
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        50: '12.5rem',
        90: '22.5rem',
        100: '25rem',
        120: '30rem',
        140: '35rem',
        160: '40rem',
        180: '45rem',
        192: '48rem',
        200: '50rem',
        240: '60rem',
        256: '64rem',
        280: '70rem',
        320: '80rem',
        360: '90rem',
        400: '100rem',
        480: '120rem',
      },
      backgroundImage: {
        'gradient-radial':
          'radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionProperty: {
        width: 'width',
        spacing: 'margin, padding',
      },
      transitionDuration: {
        400: '400ms',
      },
      transitionTimingFunction: {
        drawer: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      width: {
        128: '32rem',
        256: '64rem',
      },
      maxWidth: {
        128: '32rem',
        256: '64rem',
      },
    },
  },
  plugins: [],
};
