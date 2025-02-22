import { useStore } from '@nanostores/react';
import { type HTMLMotionProps, motion, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, ReactElement, UIEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { PanelHeaderButton } from '~/ai/components/PanelHeaderButton';
import { Slider, type SliderOptions } from '~/ai/components/Slider';
import { workbenchStore, type WorkbenchViewType } from '~/ai/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { renderLogger } from '~/utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';
import useViewport from '~/ai/lib/hooks';
import CopyRighting from '~/components/common/copyRight';
import { chatId, db, useChatHistory } from '~/ai/lib/persistence/useChatHistory';
import { forkChat, getMessages, setMessages } from '~/ai/lib/persistence/db';
import { deploy, getAppState } from '~/ai/lib/stores/cloud/cloud';
import { useNavigate } from '@remix-run/react';
import DesktopIcon from '~/assets/icons/desktop';
import MobileIcon from '~/assets/icons/mobile';
import TabletIcon from '~/assets/icons/tablet';
import GitIcon from '~/assets/icons/git-branch.svg';
import { useUser } from '~/ai/lib/context/userContext';
import ConfirmationDialog, {
  DialogConfirmationType,
  emptyConfirmationDialogHandler,
} from '~/ai/components/ConfirmationDialog';
import { chatStore, setShowChat } from '~/ai/lib/stores/chat';
import WithTooltip from '~/ai/components/Tooltip';
import {
  downloadProjectZipBuffer,
  getProjectCommits,
  ProjectCommits,
  setProjectCommits,
  uploadProject,
} from '~/ai/lib/stores/projects/code';
import SaveApp from '~/assets/icons/save-app.svg';
import SupabaseConnectClient from '~/components/supabase/SupabaseConnect.client';
import RestoreApp from '~/assets/icons/restore-app.svg';
import type { Message } from 'ai';
import Dropdown, { DropdownItems } from '~/components/common/Dropdown';

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    position: 'absolute',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

const DEVICES = [
  { label: 'Desktop', value: 100, id: 'desktop', Icon: <DesktopIcon className="w-4 h-4" /> },
  { label: 'Mobile', value: 37.5, id: 'mobile', Icon: <MobileIcon className="w-4 h-4" /> },
  { label: 'Tablet', value: 76.8, id: 'tablet', Icon: <TabletIcon className="w-4 h-4" /> },
];

export const Workbench = memo(({ chatStarted, isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const navigate = useNavigate();

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => !!previews.length));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedView = useStore(workbenchStore.currentView);
  const { showChat } = useStore(chatStore);

  const [isDeploying, setIsDeploying] = useState(false);
  const [appState, setAppState] = useState<any>(undefined);
  const [deviceMode, setDeviceMode] = useState<(typeof DEVICES)[number]>(DEVICES[0]);
  const [dialogContent, setDialogContent] = useState<{
    type: DialogConfirmationType;
    item: { description: string };
  } | null>(null);
  const [isSavingApp, setIsSavingApp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [commits, setCommits] = useState<ProjectCommits[] | null>(null);
  const projectSlug = workbenchStore.getSlug();
  const hasCommited = useMemo(() => !!commits?.length, [commits?.length]);
  const [commitToRestore, setCommitToRestore] = useState<DropdownItems | undefined>();
  const { storeMessageHistory } = useChatHistory();

  const isSmallViewport = useViewport(1024);

  const { isLoggedIn } = useUser();

  const setSelectedView = useCallback(
    (view: WorkbenchViewType) => {
      if (!isStreaming) {
        workbenchStore.currentView.set(view);
      }
    },
    [isStreaming],
  );

  useEffect(() => {
    if (!hasPreview) {
      return;
    }

    setSelectedView('preview');
  }, [hasPreview, setSelectedView]);

  const fetchAppState = useCallback(async (cached?: boolean) => {
    const state = await getAppState(cached);

    setAppState(state);
  }, []);

  const fetchProjectCommits = useCallback(async () => {
    if (!isLoggedIn()) {
      return;
    }

    const commits = await getProjectCommits(projectSlug);

    if (!commits?.length) {
      return;
    }

    setCommits(commits);
    setCommitToRestore({
      value: commits[0].sha as string,
      label: new Date(commits[0].date as Date).toLocaleString(),
    });
  }, [projectSlug, isLoggedIn()]);

  useEffect(() => {
    (async () => {
      await fetchAppState();
      await fetchProjectCommits();
    })();
  }, []);

  useEffect(() => {
    if (isDeploying) {
      return;
    }

    (async () => {
      await fetchAppState(true);
    })();
  }, [isDeploying]);

  const handleFork = async () => {
    if (isStreaming) {
      return;
    }

    try {
      if (!db || !chatId.get()) {
        toast.error('Chat persistence is not available');
        return;
      }

      const urlId = await forkChat(db, chatId.get()!);
      window.location.href = `/chat/${urlId}`;
    } catch (error) {
      toast.error('Failed to fork chat: ' + (error as Error).message);
    }
  };

  const handleForkClick = (event: UIEvent) => {
    event.preventDefault();
    setDialogContent({ type: DialogConfirmationType.FORK, item: { description: 'this chat' } });
  };

  const handleSaveAppClick = async (event: UIEvent) => {
    event.preventDefault();

    if (!isLoggedIn()) {
      goToSignIn();

      return;
    }

    setDialogContent({ type: DialogConfirmationType.SAVE, item: { description: 'this app' } });
  };

  const handleRestoreAppClick = async (event: UIEvent) => {
    event.preventDefault();

    if (!isLoggedIn()) {
      goToSignIn();

      return;
    }

    setDialogContent({ type: DialogConfirmationType.RESTORE, item: { description: 'a previous app version' } });
  };

  const handleSaveApp = async () => {
    if (isSavingApp || isStreaming) {
      return;
    }

    setIsSavingApp(true);

    try {
      const uploadedCommits = await uploadProject();

      if (!uploadedCommits?.length) {
        return;
      }

      const chat = await getMessages(db!, chatId.value!);

      if (commits?.length) {
        for (const comm of uploadedCommits) {
          const existing = commits.find(({ sha }) => comm.sha === sha);

          //Keep the same message history for the previous commits
          if (existing) {
            comm.messages = existing.messages;

            continue;
          }

          //Assign the current messages for the new commits
          comm.messages = chat.messages;
        }
      } else {
        //It means it's the first commit
        uploadedCommits[0].messages = chat.messages;
      }

      setProjectCommits(projectSlug, uploadedCommits);
      setCommits(uploadedCommits);
      setCommitToRestore({
        label: new Date(uploadedCommits[0].date).toLocaleString(),
        value: uploadedCommits[0].sha,
      });
    } catch (error) {
      console.error('Failed saving app:', error);
    } finally {
      setIsSavingApp(false);
    }
  };

  const handleRestoreApp = async () => {
    if (isRestoring || isStreaming || !commitToRestore) {
      return;
    }

    setIsRestoring(true);

    try {
      const zipArrayBuffer = await downloadProjectZipBuffer(commitToRestore.value as string);
      await workbenchStore.loadProjectFromZipBuffer(zipArrayBuffer as ArrayBuffer);

      const restoredCommit = commits?.find(({ sha }) => sha === commitToRestore.value);

      if (restoredCommit?.messages) {
        const chat = await getMessages(db!, chatId.value!);

        await setMessages(db!, chat.id, restoredCommit.messages, chat.urlId, chat.description, chat.timestamp);

        await storeMessageHistory(restoredCommit.messages);
        workbenchStore.setReloadedMessages(restoredCommit.messages.map((m) => m.id));
      }

      workbenchStore.restartBielaTerminalServer().then();
    } catch (error) {
      console.error('Failed saving app:', error);
    } finally {
      setIsRestoring(false);
      //TODO: find other solution to handle loading chat message history
      //This should be a only a temporary solution.
      window.location.reload();
    }
  };

  const closeDialog = () => {
    setDialogContent(null);
  };

  async function handleDeploy() {
    if (isDeploying) {
      return;
    }

    setIsDeploying(true); // Start deployment
    // console.log('handleDeploy...', chatId.get());

    try {
      const response = await deploy(); // Call your deploy function

      setAppState(response);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false); // Reset deployment state
    }
  }

  function openApp() {
    if (appState?.cloudApp?.url) {
      window.open(`https://${appState.cloudApp.url}`);
    }
  }

  function goToSignIn() {
    navigate('/signin');
  }

  return (
    chatStarted && (
      <motion.div
        initial="closed"
        animate={showWorkbench ? 'open' : 'closed'}
        variants={workbenchVariants}
        className={`z-workbench ${showWorkbench ? 'open' : 'closed'}`}
      >
        <div
          className={classNames(
            'fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-0 transition-[left,width] duration-200 biela-ease-cubic-bezier',
            {
              'w-full': isSmallViewport,
              'left-[var(--workbench-left)]': showWorkbench,
              'left-[100%]': !showWorkbench,
            },
          )}
        >
          <WithTooltip tooltip={showChat ? 'Hide Chat' : 'Show Chat'}>
            <span
              onClick={() => {
                setShowChat(!showChat);
              }}
              className={`${showChat ? 'i-ph:caret-left' : 'i-ph:caret-right'} absolute left-[-9px] top-[40%] w-[44px] h-[44px] bg-white cursor-pointer z-2 `}
            ></span>
          </WithTooltip>
          <div
            className={`absolute inset-0 pl-6 pr-2 lg:px-6 workbench-height ${showChat ? ' max-lg:w-[100vw]' : ''} `}
          >
            <div className="h-full flex flex-col bg-biela-elements-background-depth-2 border border-biela-elements-borderColor shadow-sm rounded-lg overflow-hidden copy-important">
              <div className="header-work-space">
                <div className={'slider'}>
                  <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
                </div>
                {selectedView !== 'code' && (
                  <div className="flex items-center gap-1">
                    {DEVICES.map((device) => (
                      <button
                        title={device.label}
                        key={device.id}
                        className={classNames(
                          'p-2 rounded-md hover:bg-[#2E2E2E] transition-colors duration-200 device-icon',
                          deviceMode.id === device.id ? 'bg-[#2E2E2E]' : 'bg-transparent',
                        )}
                        onClick={() => setDeviceMode(device)}
                      >
                        {device.Icon}
                      </button>
                    ))}
                  </div>
                )}
                <div className="right-part-btn">
                  {selectedView === 'code' && (
                    <div className="flex overflow-y-auto">
                      <div className="flex gap-1">
                        <div className={`${isStreaming ? 'opacity-50 pointer-events-none' : ''}`}>
                          <SupabaseConnectClient />
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <WithTooltip
                          tooltip={
                            hasCommited ? (
                              <div className={'flex flex-col'}>
                                <span>Lastly saved at:</span>
                                <span>
                                  {commitToRestore?.label ?? new Date(commits?.[0].date as Date).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span>There's no saved app version.</span>
                            )
                          }
                          position={'bottom'}
                        >
                          <button
                            onClick={handleRestoreAppClick}
                            className={'download-btn'}
                            disabled={!hasCommited || isStreaming}
                          >
                            <img src={RestoreApp} alt="Restore App" />
                            Restore App
                          </button>
                        </WithTooltip>
                        <button
                          onClick={handleSaveAppClick}
                          className={'download-btn'}
                          disabled={isStreaming || isSavingApp}
                        >
                          <img src={SaveApp} alt="Save App" />
                          Save App
                        </button>
                        <button
                          onClick={handleForkClick}
                          key="i-ph:git-fork"
                          className={'download-btn'}
                          disabled={isStreaming}
                        >
                          <img src={GitIcon} alt="Fork Chat" />
                          Fork Chat
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedView === 'preview' && isLoggedIn() && (
                    <div className="flex overflow-y-auto">
                      <PanelHeaderButton
                        disabled={isDeploying} // Disable button during deployment
                        className="deploy-btn glass-button"
                        disabledClassName="opacity-50 cursor-wait"
                        onClick={handleDeploy}
                      >
                        {isDeploying ? (
                          <>Deploying...</>
                        ) : (
                          <>
                            <img src="/icons/rocket.svg" alt="Deploy" />
                            Deploy
                          </>
                        )}
                      </PanelHeaderButton>
                      {appState?.cloudApp?.url && (
                        <PanelHeaderButton
                          disabled={isDeploying}
                          className="deploy-btn glass-button"
                          disabledClassName="opacity-50 cursor-wait"
                          onClick={openApp}
                        >
                          Live App
                        </PanelHeaderButton>
                      )}
                    </div>
                  )}
                  {selectedView === 'preview' && !isLoggedIn() && (
                    <PanelHeaderButton>
                      <button className={'deploy-btn glass-button'} onClick={goToSignIn}>
                        <img src="/icons/rocket.svg" alt="Code" />
                        Deploy
                      </button>
                    </PanelHeaderButton>
                  )}
                </div>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <View
                  initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
                  animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
                >
                  <EditorPanel />
                </View>
                <View
                  initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
                  animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
                >
                  <Preview isDeploying={isDeploying} deviceMode={deviceMode} />
                </View>
              </div>
            </div>

            <CopyRighting vertical={true} />
          </div>
        </div>
        <ConfirmationDialog
          isOpen={dialogContent !== null}
          type={dialogContent?.type ?? DialogConfirmationType.FORK}
          description={dialogContent?.item.description ?? ''}
          isLoading={isSavingApp || isRestoring}
          onConfirm={async () => {
            const handler = {
              ...emptyConfirmationDialogHandler,
              [DialogConfirmationType.FORK]: () => handleFork(),
              [DialogConfirmationType.SAVE]: () => handleSaveApp(),
              [DialogConfirmationType.RESTORE]: () => handleRestoreApp(),
            };

            if (dialogContent?.type) {
              await handler[dialogContent.type]();
            }

            closeDialog();
          }}
          onCancel={closeDialog}
          containerClassName={'overflow-visible'}
          content={
            dialogContent?.type === DialogConfirmationType.RESTORE &&
            !!commits?.length && (
              <div>
                <p>Please select a commit to restore:</p>
                <Dropdown
                  value={commitToRestore}
                  items={
                    commits?.map(({ sha: value, date }) => ({
                      value,
                      label: new Date(date).toLocaleString(),
                    })) || []
                  }
                  disabled={isRestoring}
                  onSelect={(select: DropdownItems) => {
                    if (select) {
                      setCommitToRestore(select);
                    }
                  }}
                />
              </div>
            )
          }
        />
      </motion.div>
    )
  );
});

Workbench.displayName = 'WorkbenchClient';

interface ViewProps extends HTMLMotionProps<'div'> {
  children: ReactElement;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});
