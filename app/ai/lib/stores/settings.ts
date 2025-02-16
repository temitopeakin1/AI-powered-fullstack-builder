import { atom, map } from 'nanostores';
import { workbenchStore } from './workbench';
export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
}

export interface Shortcuts {
  toggleTerminal: Shortcut;
}

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

// TODO: need to create one single map for all these flags

export const isDebugMode = atom(false);

export const isEventLogsEnabled = atom(false);

export const promptStore = atom<string>('default');

export const latestBranchStore = atom(false);

export const autoSelectStarterTemplate = atom(false);
export const enableContextOptimizationStore = atom(false);
