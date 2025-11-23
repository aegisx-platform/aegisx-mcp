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
          faint: 'var(--ax-brand-faint)',
          muted: 'var(--ax-brand-muted)',
          subtle: 'var(--ax-brand-subtle)',
          DEFAULT: 'var(--ax-brand-default)',
          emphasis: 'var(--ax-brand-emphasis)',
          strong: 'var(--ax-brand-strong)',
          inverted: 'var(--ax-brand-inverted)',
        },

        // Success Colors
        success: {
          faint: 'var(--ax-success-faint)',
          muted: 'var(--ax-success-muted)',
          subtle: 'var(--ax-success-subtle)',
          DEFAULT: 'var(--ax-success-default)',
          emphasis: 'var(--ax-success-emphasis)',
          inverted: 'var(--ax-success-inverted)',
        },

        // Warning Colors
        warning: {
          faint: 'var(--ax-warning-faint)',
          muted: 'var(--ax-warning-muted)',
          subtle: 'var(--ax-warning-subtle)',
          DEFAULT: 'var(--ax-warning-default)',
          emphasis: 'var(--ax-warning-emphasis)',
          inverted: 'var(--ax-warning-inverted)',
        },

        // Error/Danger Colors
        error: {
          faint: 'var(--ax-error-faint)',
          muted: 'var(--ax-error-muted)',
          subtle: 'var(--ax-error-subtle)',
          DEFAULT: 'var(--ax-error-default)',
          emphasis: 'var(--ax-error-emphasis)',
          inverted: 'var(--ax-error-inverted)',
        },

        // Info Colors
        info: {
          faint: 'var(--ax-info-faint)',
          muted: 'var(--ax-info-muted)',
          subtle: 'var(--ax-info-subtle)',
          DEFAULT: 'var(--ax-info-default)',
          emphasis: 'var(--ax-info-emphasis)',
          inverted: 'var(--ax-info-inverted)',
        },

        // Cyan Colors
        cyan: {
          faint: 'var(--ax-cyan-faint)',
          muted: 'var(--ax-cyan-muted)',
          subtle: 'var(--ax-cyan-subtle)',
          DEFAULT: 'var(--ax-cyan-default)',
          emphasis: 'var(--ax-cyan-emphasis)',
          inverted: 'var(--ax-cyan-inverted)',
        },

        // Purple Colors
        purple: {
          faint: 'var(--ax-purple-faint)',
          muted: 'var(--ax-purple-muted)',
          subtle: 'var(--ax-purple-subtle)',
          DEFAULT: 'var(--ax-purple-default)',
          emphasis: 'var(--ax-purple-emphasis)',
          inverted: 'var(--ax-purple-inverted)',
        },

        // Indigo Colors
        indigo: {
          faint: 'var(--ax-indigo-faint)',
          muted: 'var(--ax-indigo-muted)',
          subtle: 'var(--ax-indigo-subtle)',
          DEFAULT: 'var(--ax-indigo-default)',
          emphasis: 'var(--ax-indigo-emphasis)',
          inverted: 'var(--ax-indigo-inverted)',
        },

        // Pink Colors
        pink: {
          faint: 'var(--ax-pink-faint)',
          muted: 'var(--ax-pink-muted)',
          subtle: 'var(--ax-pink-subtle)',
          DEFAULT: 'var(--ax-pink-default)',
          emphasis: 'var(--ax-pink-emphasis)',
          inverted: 'var(--ax-pink-inverted)',
        },

        // Background Colors
        background: {
          muted: 'var(--ax-background-muted)',
          subtle: 'var(--ax-background-subtle)',
          DEFAULT: 'var(--ax-background-default)',
          emphasis: 'var(--ax-background-emphasis)',
        },

        // Text Colors
        text: {
          disabled: 'var(--ax-text-disabled)',
          subtle: 'var(--ax-text-subtle)',
          secondary: 'var(--ax-text-secondary)',
          primary: 'var(--ax-text-primary)',
          heading: 'var(--ax-text-heading)',
          inverted: 'var(--ax-text-inverted)',
        },

        // Border Colors
        border: {
          muted: 'var(--ax-border-muted)',
          DEFAULT: 'var(--ax-border-default)',
          emphasis: 'var(--ax-border-emphasis)',
        },
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
