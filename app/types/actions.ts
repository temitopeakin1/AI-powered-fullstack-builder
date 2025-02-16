export type ActionType = 'file' | 'shell' | 'unit_testing_shell';

export interface BaseAction {
  content: string;
}

export interface FileAction extends BaseAction {
  type: 'file';
  filePath: string;
}

export interface ShellAction extends BaseAction {
  type: 'shell';
}

export interface UnitTestingShellAction extends BaseAction {
  type: 'unit_testing_shell';
}

export interface StartAction extends BaseAction {
  type: 'start';
}

export type bielaAction = FileAction | ShellAction | UnitTestingShellAction | StartAction;

export type bielaActionData = bielaAction | BaseAction;

export interface ActionAlert {
  type: string;
  title: string;
  description: string;
  content: string;
  source?: 'terminal' | 'preview'; // Add source to differentiate between terminal and preview errors
}
