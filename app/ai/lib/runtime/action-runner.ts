import { WebContainer } from '@webcontainer/api';
import { atom, map, type MapStore } from 'nanostores';
import * as nodePath from 'node:path';
import type { ActionAlert, bielaAction,MigrationAction } from '~/types/actions';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';
import type { ActionCallbackData } from './message-parser';
import type { bielaShell } from '~/utils/shell';
import { LastInputOnTerminal } from '~/ai/lib/stores/lastInputOnTerminal';
import {backendApiFetch} from "~/ai/lib/backend-api";
import {UserStore} from "~/ai/lib/stores/user/userStore";
import {toast} from "react-toastify";

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = bielaAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = bielaAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

class ActionCommandError extends Error {
  readonly _output: string;
  readonly _header: string;

  constructor(message: string, output: string) {
    // Create a formatted message that includes both the error message and output
    const formattedMessage = `Failed To Execute Shell Command: ${message}\n\nOutput:\n${output}`;
    super(formattedMessage);

    // Set the output separately so it can be accessed programmatically
    this._header = message;
    this._output = output;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ActionCommandError.prototype);

    // Set the name of the error for better debugging
    this.name = 'ActionCommandError';
  }

  // Optional: Add a method to get just the terminal output
  get output() {
    return this._output;
  }

  get header() {
    return this._header;
  }
}

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();
  #shellTerminal: () => bielaShell;
  #shellUnitTestingTerminal: () => bielaShell;
  runnerId = atom<string>(`${Date.now()}`);
  actions: ActionsMap = map({});
  onAlert?: (alert: ActionAlert) => void;

  constructor(
    webcontainerPromise: Promise<WebContainer>,
    getShellTerminal: () => bielaShell,
    getUnitTestingShellTerminal: () => bielaShell,
    onAlert?: (alert: ActionAlert) => void,
  ) {
    this.#webcontainer = webcontainerPromise;
    this.#shellTerminal = getShellTerminal;
    this.#shellUnitTestingTerminal = getUnitTestingShellTerminal;
    this.onAlert = onAlert;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      if (action.type === 'file' && action.status === 'running') {
        this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
      }

      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData, isStreaming: boolean = false) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return; // No return value here
    }

    if (isStreaming && action.type !== 'file') {
      return; // No return value here
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: !isStreaming });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId, isStreaming);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });

    await this.#currentExecutionPromise;

    return;
  }

  async #executeAction(actionId: string, isStreaming: boolean = false) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'unit_testing_shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
        case 'migration': {
          await this.#runMigrationAction(action);
          break;
        }
        case 'start': {
          // making the start app non blocking

          this.#runStartAction(action)
            .then(() => this.#updateAction(actionId, { status: 'complete' }))
            .catch((err: Error) => {
              if (action.abortSignal.aborted) {
                return;
              }

              this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
              logger.error(`[${action.type}]:Action failed\n\n`, err);

              if (!(err instanceof ActionCommandError)) {
                return;
              }


                this.onAlert?.({
                  type: 'error',
                  title: 'Dev Server Failed',
                  description: err.header,
                  content: err.output,

              })

            });

          /*
           * adding a delay to avoid any race condition between 2 start actions
           * i am up for a better approach
           */
          await new Promise((resolve) => setTimeout(resolve, 2000));

          return;
        }
      }

      this.#updateAction(actionId, {
        status: isStreaming ? 'running' : action.abortSignal.aborted ? 'aborted' : 'complete',
      });
    } catch (error) {
      if (action.abortSignal.aborted) {
        return;
      }

      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
      logger.error(`[${action.type}]:Action failed\n\n`, error);

      if (!(error instanceof ActionCommandError)) {
        return;
      }

      if (action.type !==  'migration') {

        this.onAlert?.({
          type: 'error',
          title: 'Dev Server Failed',
          description: error.header,
          content: error.output,
        });
      }

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell' && action.type !== 'unit_testing_shell') {
      unreachable('Expected shell action');
    }

    const shell = action.type == 'unit_testing_shell' ? this.#shellUnitTestingTerminal() : this.#shellTerminal();
    await shell.ready();

    if (!shell || !shell.terminal || !shell.process) {
      unreachable('Shell terminal not found');
    }

    const resp = await shell.executeCommand(this.runnerId.get(), action.content, () => {
      logger.debug(`[${action.type}]:Aborting Action\n\n`, action);
      action.abort();
    });
    logger.debug(`${action.type} Shell Response: [exit code:${resp?.exitCode}]`);

    const respIsSuccess = resp?.exitCode == 0;

    if (!respIsSuccess && !LastInputOnTerminal.isCtrlCCommand()) {
      throw new ActionCommandError('Failed To Execute Shell Command', resp?.output || 'No Output Available');
    }
  }

  async #runStartAction(action: ActionState) {
    if (action.type !== 'start') {
      unreachable('Expected shell action');
    }

    if (!this.#shellTerminal) {
      unreachable('Shell terminal not found');
    }

    const shell = this.#shellTerminal();
    await shell.ready();

    if (!shell || !shell.terminal || !shell.process) {
      unreachable('Shell terminal not found');
    }

    const resp = await shell.executeCommand(this.runnerId.get(), action.content, () => {
      logger.debug(`[${action.type}]:Aborting Action\n\n`, action);
      action.abort();
    });
    logger.debug(`${action.type} Shell Response: [exit code:${resp?.exitCode}]`);

    const respIsSuccess = resp?.exitCode == 0;

    if (!respIsSuccess && !LastInputOnTerminal.isCtrlCCommand()) {
      throw new ActionCommandError('Failed To Start Application', resp?.output || 'No Output Available');
    }

    return resp;
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;
    const relativePath = nodePath.relative(webcontainer.workdir, action.filePath);

    let folder = nodePath.dirname(relativePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    if (folder !== '.') {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created folder', folder);
      } catch (error) {
        logger.error('Failed to create folder\n\n', error);
      }
    }

    try {
      await webcontainer.fs.writeFile(relativePath, action.content);
      logger.debug(`File written ${relativePath}`);
    } catch (error) {
      logger.error('Failed to write file\n\n', error);
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }

  async #runMigrationAction(action: ActionState) {
    if (action.type !== 'migration') {
      unreachable('Expected migration action');
    }

    const userStore = UserStore.getInstance();
    const user = userStore.getUser();

    if (!user) {
      return;
    }
    try {
      const webcontainer = await this.#webcontainer;
      const cleanPath = action.path.replace(/^\/home\/project\//, '');
      const fileContent = await webcontainer.fs.readFile(cleanPath, 'utf-8');
      const chatId = localStorage.getItem('chatID');
      const projectSlug =localStorage.getItem('projectSlug');


      if (!projectSlug) {
        throw new Error('Project not found');
      }

      const response = await backendApiFetch(`/supabase/migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          migrationContent: fileContent,
          path: cleanPath,
          projectSlug: projectSlug
        })
      });

      const migrationResponse = await response.json();


      if (migrationResponse.success === false) {

        if (migrationResponse.error === 'SERVICE_UNAVAILABLE') {
          const toastId = toast.error(migrationResponse.message);

          toast.update(toastId, {
            duration: Infinity,
            autoClose: false
          });
          throw new Error(migrationResponse.message);
        }

        this.onAlert?.({
          type: 'migration',
          title: 'Migration Failed',
          description: migrationResponse.message,
          content: migrationResponse.error,
          source:'preview',
        });

        throw new Error(migrationResponse.message);
      }

      logger.info('Migration executed successfully:', migrationResponse);

      return migrationResponse;

    } catch (error) {

      logger.error(`Migration failed for user: ${user.id} :`, error);
      throw new ActionCommandError(
        'Failed to execute migration',
        ''
      );
    }
  }
}
