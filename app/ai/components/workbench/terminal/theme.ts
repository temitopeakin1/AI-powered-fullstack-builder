import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--biela-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--biela-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--biela-elements-terminal-textColor'),
    background: cssVar('--biela-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--biela-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--biela-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--biela-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--biela-elements-terminal-color-black'),
    red: cssVar('--biela-elements-terminal-color-red'),
    green: cssVar('--biela-elements-terminal-color-green'),
    yellow: cssVar('--biela-elements-terminal-color-yellow'),
    blue: cssVar('--biela-elements-terminal-color-blue'),
    magenta: cssVar('--biela-elements-terminal-color-magenta'),
    cyan: cssVar('--biela-elements-terminal-color-cyan'),
    white: cssVar('--biela-elements-terminal-color-white'),
    brightBlack: cssVar('--biela-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--biela-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--biela-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--biela-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--biela-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--biela-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--biela-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--biela-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
