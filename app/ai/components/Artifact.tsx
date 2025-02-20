import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import React, { memo, useMemo, useRef, useState } from 'react';
import { type BundledLanguage, type BundledTheme, createHighlighter, type HighlighterGeneric } from 'shiki';
import type { ActionState } from '~/ai/lib/runtime/action-runner';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { WORK_DIR } from '~/utils/constants';
import { chatStore } from '~/ai/lib/stores/chat';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);
  const [allActionFinished, setAllActionFinished] = useState(false);
  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];
  const actions = useStore(computed(artifact.runner.actions, (actions) => Object.values(actions)));

  const toggleActions = () => {
    userToggledActions.current = true;
    setShowActions((prev) => !prev);
  };

  useMemo(() => {
    if (!actions.length) {
      return;
    }

    if (!showActions && !userToggledActions.current) {
      setShowActions(true);
    }

    const finished = actions.every((action) => action.status === 'complete');

    if (artifact.type === 'bundled' && allActionFinished !== finished) {
      setAllActionFinished(finished);
    }
  }, [JSON.stringify(actions)]);

  useMemo(() => {
    if (!actions.length) {
      return;
    }

    const isRunning = actions.some((action) => action.status === 'running');

    if (isRunning || chatStore.get().isStreaming) {
      return;
    }

    if (workbenchStore.currentView.get() !== 'preview') {
      workbenchStore.currentView.set('preview');
    }
  }, [chatStore.get().isStreaming]);

  return (
    <div
      style={{ background: 'linear-gradient(2deg, #1D1D1D 1.56%, #000 98.44%)' }}
      className="artifact flex rounded-lg border border-[#2F2F2F] flex-col overflow-hidden w-full transition-border duration-150"
    >
      <div
        className="flex  px-[10px] py-[16px] cursor-pointer"
        onClick={() => {
          toggleActions();
        }}
      >
        <button className="flex items-center bg-transparent w-full overflow-hidden">
          {artifact.type == 'bundled' && (
            <>
              <div className="p-4">
                {allActionFinished ? (
                  <div className={'i-ph:files-light'} style={{ fontSize: '2rem' }}></div>
                ) : (
                  <div className={'i-svg-spinners:90-ring-with-bg spinner'} style={{ fontSize: '2rem' }}></div>
                )}
              </div>
              <div className="bg-biela-elements-artifacts-borderColor w-[1px]" />
            </>
          )}
          <div className="w-full text-left">
            <div className="w-full text-biela-elements-textPrimary font-medium leading-5 text-sm">
              {artifact?.title}
            </div>
          </div>
        </button>
        <div className="w-[1px]" />
        <AnimatePresence>
          {actions.length && artifact.type !== 'bundled' && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="bg-transparent"
              onClick={toggleActions}
            >
              <div>
                {showActions ? (
                  <img src="/icons/arrow-up.svg" alt="Up" />
                ) : (
                  <img src="/icons/arrow-down.svg" alt="Down" />
                )}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {artifact.type !== 'bundled' && showActions && actions.length > 0 && (
          <motion.div
            className="actions border-t border-t-[#2F2F2F]"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-left">
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface ShellCodeBlockProps {
  className?: string;
  code: string;
}

function ShellCodeBlock({ className, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', className)}
      dangerouslySetInnerHTML={{
        __html: shellHighlighter.codeToHtml(code, {
          lang: 'shell',
          theme: 'dark-plus',
        }),
      }}
    ></div>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function openArtifactInWorkbench(filePath: string) {
  if (workbenchStore.currentView.get() !== 'code') {
    workbenchStore.currentView.set('code');
  }

  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}

function normalizePath(filePath: string, baseDir: string) {
  return filePath.replace(baseDir, '');
}

function getBaseDir(path: string) {
  const srcIndex = path.indexOf('src/');
  return srcIndex !== -1 ? path.substring(0, srcIndex) : '/home/project/';
}

const ActionList = memo(({ actions }: ActionListProps) => {
  const [fileStates, setFileStates] = useState<{ [key: string]: boolean }>({});
  const files = useStore(workbenchStore.files);
  const initialFilesRef = useRef<Set<string>>(new Set());
  const [createdFiles, setCreatedFiles] = useState<Set<string>>(new Set());

  useMemo(() => {
    if (!files && !actions.length) {
      return;
    }

    if (initialFilesRef.current.size === 0) {
      initialFilesRef.current = new Set(Object.keys(files).map((key) => normalizePath(key, getBaseDir(key))));
    }

    const newFileStates: { [key: string]: boolean } = {};

    for (const action of actions) {
      if (action.type !== 'file') {
        continue;
      }

      const normalizedPath = normalizePath(action.filePath, getBaseDir(action.filePath));
      const isCreated = createdFiles.has(normalizedPath);
      const isInitial = initialFilesRef.current.has(normalizedPath);

      newFileStates[action.filePath] = !isCreated && isInitial;

      if (!isCreated && !isInitial) {
        setCreatedFiles((prev) => new Set(prev.add(normalizedPath)));
      }
    }

    setFileStates(newFileStates);
  }, [files, JSON.stringify(actions), createdFiles]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <ul className="list-none space-y-2.5" style={{ padding: '16px', borderRadius: '8px' }}>
        {actions.map((action, index) => {
          const { status, type, content } = action;
          const isLast = index === actions.length - 1;
          const actionLabel = type === 'file' && fileStates[action.filePath] ? 'Update' : 'Create';
          localStorage.setItem('isBouncing', 'true');

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.2,
                ease: cubicEasingFn,
              }}
            >
              <div className="flex items-center gap-1.5 text-sm">
                <div className={classNames('text-lg', getIconColor(status))}>
                  {status === 'running' ? (
                    <>
                      {type !== 'start' ? (
                        <div className="i-svg-spinners:90-ring-with-bg spinner"></div>
                      ) : (
                        <img src="/icons/terminal.svg" alt="Terminal" />
                      )}
                    </>
                  ) : status === 'pending' ? (
                    <div className="i-ph:circle-duotone"></div>
                  ) : status === 'complete' ? (
                    <div className="i-ph:check"></div>
                  ) : status === 'failed' || status === 'aborted' ? (
                    <div className="i-ph:x"></div>
                  ) : null}
                </div>
                {type === 'file' ? (
                  <div className="create-text">
                    {actionLabel}{' '}
                    <code
                      className={classNames([
                        'bg-biela-elements-artifacts-inlineCode-background px-1.5 py-1 rounded-md pack-font',
                        status === 'complete' && !chatStore.get().isStreaming ? 'hover:underline cursor-pointer' : '',
                      ])}
                      onClick={() =>
                        status === 'complete' &&
                        !chatStore.get().isStreaming &&
                        openArtifactInWorkbench(action.filePath)
                      }
                    >
                      {action.filePath}
                    </code>
                  </div>
                ) : type === 'shell' || type === 'unit_testing_shell' ? (
                  <div className="flex items-center w-full min-h-[28px]">
                    <span className="flex-1">Run command</span>
                  </div>
                ) : type === 'start' ? (
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      workbenchStore.currentView.set('preview');
                    }}
                    className="flex items-center w-full min-h-[28px]"
                  >
                    <span className="flex-1" style={{ color: '#fff' }}>
                      Start Application
                    </span>
                  </a>
                ) :type === 'migration' ? (
                  <div className="flex items-center w-full min-h-[28px]">
                    <span className="flex-1">Run migration</span>
                  </div>
                ) : null}
              </div>
              {(type === 'shell' || type === 'start' || type === 'unit_testing_shell') && (
                <ShellCodeBlock className={classNames('mt-1', { 'mb-3.5': !isLast })} code={content} />
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});
ActionList.displayName = 'ActionList';

function getIconColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-biela-elements-textTertiary';
    }
    case 'running': {
      return 'text-biela-elements-loader-progress';
    }
    case 'complete': {
      return 'text-biela-elements-icon-success';
    }
    case 'aborted': {
      return 'text-biela-elements-textSecondary';
    }
    case 'failed': {
      return 'text-biela-elements-icon-error';
    }
    default: {
      return undefined;
    }
  }
}
