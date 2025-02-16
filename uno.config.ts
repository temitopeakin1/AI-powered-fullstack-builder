import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'biela';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  accent: {
    50: '#F8F5FF',
    100: '#F0EBFF',
    200: '#E1D6FF',
    300: '#CEBEFF',
    400: '#B69EFF',
    500: '#9C7DFF',
    600: '#8A5FFF',
    700: '#7645E8',
    800: '#6234BB',
    900: '#502D93',
    950: '#2D1959',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  orange: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
  },
};

export default defineConfig({
  safelist: [
    ...Object.keys(customIconCollection[collectionName]||{}).map(x=>`i-biela:${x}`)
  ],
  shortcuts: {
    'biela-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 biela-ease-cubic-bezier',
    kdb: 'bg-biela-elements-code-background text-biela-elements-code-text py-1 px-1.5 rounded-md',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
    'bg-black-full': 'bg-black min-h-screen',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    colors: {
      ...COLOR_PRIMITIVES,
      biela: {
        elements: {
          borderColor: 'var(--biela-elements-borderColor)',
          borderColorActive: 'var(--biela-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--biela-elements-bg-depth-1)',
              2: 'var(--biela-elements-bg-depth-2)',
              3: 'var(--biela-elements-bg-depth-3)',
              4: 'var(--biela-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--biela-elements-textPrimary)',
          textSecondary: 'var(--biela-elements-textSecondary)',
          textTertiary: 'var(--biela-elements-textTertiary)',
          code: {
            background: 'var(--biela-elements-code-background)',
            text: 'var(--biela-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--biela-elements-button-primary-background)',
              backgroundHover: 'var(--biela-elements-button-primary-backgroundHover)',
              text: 'var(--biela-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--biela-elements-button-secondary-background)',
              backgroundHover: 'var(--biela-elements-button-secondary-backgroundHover)',
              text: 'var(--biela-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--biela-elements-button-danger-background)',
              backgroundHover: 'var(--biela-elements-button-danger-backgroundHover)',
              text: 'var(--biela-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--biela-elements-item-contentDefault)',
            contentActive: 'var(--biela-elements-item-contentActive)',
            contentAccent: 'var(--biela-elements-item-contentAccent)',
            contentDanger: 'var(--biela-elements-item-contentDanger)',
            backgroundDefault: 'var(--biela-elements-item-backgroundDefault)',
            backgroundActive: 'var(--biela-elements-item-backgroundActive)',
            backgroundAccent: 'var(--biela-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--biela-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--biela-elements-actions-background)',
            code: {
              background: 'var(--biela-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--biela-elements-artifacts-background)',
            backgroundHover: 'var(--biela-elements-artifacts-backgroundHover)',
            borderColor: 'var(--biela-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--biela-elements-artifacts-inlineCode-background)',
              text: 'var(--biela-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--biela-elements-messages-background)',
            linkColor: 'var(--biela-elements-messages-linkColor)',
            code: {
              background: 'var(--biela-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--biela-elements-messages-inlineCode-background)',
              text: 'var(--biela-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--biela-elements-icon-success)',
            error: 'var(--biela-elements-icon-error)',
            primary: 'var(--biela-elements-icon-primary)',
            secondary: 'var(--biela-elements-icon-secondary)',
            tertiary: 'var(--biela-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--biela-elements-preview-addressBar-background)',
              backgroundHover: 'var(--biela-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--biela-elements-preview-addressBar-backgroundActive)',
              text: 'var(--biela-elements-preview-addressBar-text)',
              textActive: 'var(--biela-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--biela-elements-terminals-background)',
            buttonBackground: 'var(--biela-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--biela-elements-dividerColor)',
          loader: {
            background: 'var(--biela-elements-loader-background)',
            progress: 'var(--biela-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--biela-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--biela-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--biela-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--biela-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--biela-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--biela-elements-cta-background)',
            text: 'var(--biela-elements-cta-text)',
          },
        },
      },
    },
    fontFamily: {
      retro: ['Rexton', 'serif'],
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
      fontSize: {
        base: '1rem',
        lg: '1.125rem',
        xs: '0.75rem',
        sm: '0.875rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
      },
      lineHeight: {
        normal: '1.5',
        relaxed: '1.75',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
