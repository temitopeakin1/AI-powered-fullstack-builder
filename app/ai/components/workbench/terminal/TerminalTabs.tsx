import { useStore } from '@nanostores/react';
import React, { memo, useEffect, useRef, useState } from 'react';
import { type ImperativePanelHandle, Panel } from 'react-resizable-panels';
import { Terminal } from './Terminal';

import { Pause, RefreshCcw, X } from 'lucide-react';
import { createScopedLogger } from '~/utils/logger';
import { themeStore } from '~/ai/lib/stores/theme';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { shortcutEventEmitter } from '~/ai/lib/hooks';
import { classNames } from '~/utils/classNames';
import { IconButton } from '~/components/common/IconButton';

const logger = createScopedLogger('Terminal');

const MAX_TERMINALS = 5;
export const DEFAULT_TERMINAL_SIZE = 25;

export const TerminalTabs = memo(() => {
  const theme = useStore(themeStore);
  const showTerminal = useStore(workbenchStore.showTerminal);

  const terminalPanelRef = useRef<ImperativePanelHandle>(null);
  const terminalToggledByShortcut = useRef(false);

  // Initialize with one terminal
  const [terminals, setTerminals] = useState([
    {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    },
    {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    },
  ]);
  const [activeTerminal, setActiveTerminal] = useState(() => terminals[0].id);
  const [terminalCount, setTerminalCount] = useState(1);

  const addTerminal = () => {
    if (terminalCount < MAX_TERMINALS) {
      const newTerminal = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      };
      setTerminals((prev) => [...prev, newTerminal]);
      setTerminalCount((prev) => prev + 1);
      setActiveTerminal(newTerminal.id);
    }
  };

  const deleteTerminal = (terminalId: string, event: React.MouseEvent) => {
    // Stop the click from propagating to the terminal button
    event.stopPropagation();

    const terminalsCopy = terminals.filter((terminal) => terminal.id !== terminalId);

    // If we're deleting the active terminal or if there will be no active terminal
    if (terminalId === activeTerminal || !terminalsCopy.find((t) => t.id === activeTerminal)) {
      // Find the index of the terminal being deleted
      const deletedIndex = terminals.findIndex((t) => t.id === terminalId);

      /*
       * If we're deleting the last terminal, activate the previous one
       * Otherwise activate the next terminal
       */
      const newActiveIndex =
        deletedIndex === terminals.length - 1
          ? Math.max(0, deletedIndex - 1)
          : Math.min(deletedIndex, terminalsCopy.length - 1);

      const newActiveId = terminalsCopy[newActiveIndex]?.id;

      // Set the new active terminal before updating the terminals list
      setActiveTerminal(newActiveId);
    }

    setTerminals(terminalsCopy);
    setTerminalCount((prev) => prev - 1);
  };

  useEffect(() => {
    const { current: terminal } = terminalPanelRef;

    if (!terminal) {
      return;
    }

    const isCollapsed = terminal.isCollapsed();

    if (!showTerminal && !isCollapsed) {
      terminal.collapse();
    } else if (showTerminal && isCollapsed) {
      terminal.resize(DEFAULT_TERMINAL_SIZE);
    }

    terminalToggledByShortcut.current = false;
  }, [showTerminal]);

  useEffect(() => {
    const unsubscribeFromEventEmitter = shortcutEventEmitter.on('toggleTerminal', () => {
      terminalToggledByShortcut.current = true;
    });

    const unsubscribeFromThemeStore = themeStore.subscribe(() => { });

    return () => {
      unsubscribeFromEventEmitter();
      unsubscribeFromThemeStore();
    };
  }, []);

  return (
    <Panel
      ref={terminalPanelRef}
      defaultSize={showTerminal ? DEFAULT_TERMINAL_SIZE : 0}
      minSize={10}
      collapsible
      onExpand={() => {
        if (!terminalToggledByShortcut.current) {
          workbenchStore.toggleTerminal(true);
        }
      }}
      onCollapse={() => {
        if (!terminalToggledByShortcut.current) {
          workbenchStore.toggleTerminal(false);
        }
      }}
    >
      <div className="h-full">
        <div className="bg-biela-elements-terminals-background h-full flex flex-col terminal-pills">
          <div className="flex items-center bg-biela-elements-background-depth-2 border-y border-biela-elements-borderColor gap-1.5 min-h-[34px] p-2">
            {terminals.map((terminal, index) => {
              const isActive = activeTerminal === terminal.id;
              return (
                <React.Fragment key={index}>
                  {index == 0 || index == 1 ? (
                    <button
                      key={terminal.id}
                      className={classNames(
                        'flex items-center text-sm cursor-pointer gap-1.5 px-3 py-2 h-full whitespace-nowrap rounded-full',
                        {
                          'bg-biela-elements-terminals-buttonBackground text-biela-elements-textPrimary': isActive,
                          'bg-biela-elements-background-depth-2 text-biela-elements-textSecondary': !isActive,
                        },
                      )}
                      onClick={() => {
                        setActiveTerminal(terminal.id);

                        if (index === 1) {
                          workbenchStore.actionAlert.set({
                            type: 'unitTesting',
                            title: 'Suggestion',
                            description: 'Would you like to implement Unit Tests for your project???',
                            content: 'Content',
                            source: 'preview',
                          });
                        }
                      }}
                    >
                      <img src="/icons/terminal.svg" alt="Toggle Device Mode" />
                      {index == 0 ? 'Biela Terminal' : 'Unit Testing'}
                    </button>
                  ) : (
                    <React.Fragment>
                      <button
                        key={terminal.id}
                        className={classNames(
                          'flex items-center text-sm cursor-pointer gap-1.5 px-3 py-2 h-full whitespace-nowrap rounded-full',
                          {
                            'bg-biela-elements-terminals-buttonBackground text-biela-elements-textPrimary': isActive,
                            'bg-biela-elements-background-depth-2 text-biela-elements-textSecondary': !isActive,
                          },
                        )}
                        onClick={() => setActiveTerminal(terminal.id)}
                      >
                        <img src="/icons/terminal.svg" alt="Toggle Device Mode" />
                        Terminal {terminalCount > 1 && index - 1}
                        <X
                          color="#FF5656"
                          className="ml-2 cursor-pointer"
                          size={16}
                          onClick={(e) => deleteTerminal(terminal.id, e)}
                        />
                      </button>
                    </React.Fragment>
                  )}
                </React.Fragment>
              );
            })}
            {terminalCount < MAX_TERMINALS && <IconButton icon="plus" size="sm" onClick={addTerminal} />}
            <div className="flex gap-2 ms-auto">
              <button onClick={() => workbenchStore.stopBielaTerminalServer()} title="Stop Server" className='bg-transparent border-none'>
                <Pause size={16} color="#ffffff" />
              </button>
              <button onClick={() => workbenchStore.restartBielaTerminalServer()} title="Restart Server" className='bg-transparent border-none'>
                <RefreshCcw size={16} color="#ffffff" />
              </button>
            </div>
          </div>
          {terminals.map((terminal, index) => {
            const isActive = activeTerminal === terminal.id;

            logger.debug(`Starting terminal [${terminal.id}]`);

            if (index === 0) {
              return (
                <Terminal
                  key={terminal.id}
                  id={`terminal_${terminal.id}`}
                  className={classNames('h-full overflow-hidden', {
                    hidden: !isActive,
                  })}
                  onTerminalReady={(terminal) => {
                    workbenchStore.attachbielaTerminal(terminal);
                  }}
                  onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                  theme={theme}
                />
              );
            } else if (index === 1) {
              return (
                <Terminal
                  key={terminal.id}
                  id={`terminal_${terminal.id}`}
                  className={classNames('h-full overflow-hidden', {
                    hidden: !isActive,
                  })}
                  onTerminalReady={(terminal) => workbenchStore.attachUnitTestingTerminal(terminal)}
                  onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                  theme={theme}
                />
              );
            } else {
              return (
                <Terminal
                  key={terminal.id}
                  id={`terminal_${terminal.id}`}
                  className={classNames('h-full overflow-hidden', {
                    hidden: !isActive,
                  })}
                  onTerminalReady={(terminal) => workbenchStore.attachTerminal(terminal)}
                  onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                  theme={theme}
                />
              );
            }
          })}
        </div>
      </div>
    </Panel>
  );
});
