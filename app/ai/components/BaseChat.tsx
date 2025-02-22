// BaseChat.tsx
/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from '../styles/BaseChat.module.scss';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { toast } from 'react-toastify';
import type { ActionAlert } from '~/types/actions';
import ChatAlert from './ChatAlert';
import '../../components/styles/ainmated-spinner.scss';
import TokenRemaining from './TokensRemaining.client';
import { ChatCodeSwitch } from '~/ai/components/ChatCodeSwitch';
import WithTooltip from './Tooltip';
import { IconButton } from '~/components/common/IconButton';
import FileIcon from '~/assets/icons/fileIcon';
import { SpeechRecognitionButton } from '~/ai/components/SpeechRecognition';
import CopyRighting from '~/components/common/copyRight';
import { Workbench } from '~/ai/components/workbench/Workbench.client';
import { ExamplePrompts } from '~/ai/components/ExamplePrompts';
import { Menu } from './Menu.client';
import NewBgBiela from '~/assets/icons/new-biela.png';
import MagicIcon from '~/assets/icons/magicIcon.svg';
import { createScopedLogger } from '~/utils/logger';
import ChatSuggestion from '~/ai/components/ChatSuggestion';
import CheckList from '~/assets/icons/checkList';
import { chatStore, setCheckingList, setCleaningProject, setShowPrompt } from '~/ai/lib/stores/chat';
import { useStore } from '@nanostores/react';
import { useParams } from '@remix-run/react';
import { backendApiFetch } from '~/ai/lib/backend-api';
import CleanUpIcon from '~/assets/icons/refresh.svg';

const TEXTAREA_MIN_HEIGHT = 76;

const logger = createScopedLogger('BaseChat');

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      input = '',
      enhancingPrompt,
      handleInputChange,
      enhancePrompt,
      sendMessage,
      handleStop,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const { showPrompt, checkingList, cleaningProject } = useStore(chatStore);
    const { chatId } = useParams();
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
      let active = true;

      // Pornim animația de la starea curentă a rotației
      let angle = rotation;

      function updateRotation() {
        if (!active) {
          return;
        }

        // Incrementăm unghiul și îl normalizăm la [0, 360)
        angle = (angle + 1) % 360;
        setRotation(angle);

        /*
         * Dacă streaming-ul este activ, continuăm animația.
         * Dacă nu, mai continuăm doar până când unghiul revine la 0.
         */
        if (isStreaming || angle !== 0) {
          setTimeout(() => {
            requestAnimationFrame(() => {
              if (active) {
                updateRotation();
              }
            });
          }, 5000 / 360);
        } else {
          // Când animația s-a terminat (angle a revenit la 0), oprim animația.
          setRotation(0);
        }
      }

      /*
       * Pornim animația dacă:
       * - streaming-ul e activ, sau
       * - streaming-ul a devenit false, dar animația nu s-a terminat încă (rotation !== 0)
       */
      if (isStreaming || rotation !== 0) {
        updateRotation();
      }

      // Cleanup: oprim orice actualizare ulterioară când componenta se demontează sau când 'isStreaming' se schimbă
      return () => {
        active = false;
      };
    }, [isStreaming]);

    useEffect(() => {
      if (chatId) {
        localStorage.setItem('chatId', chatId);
      }
    }, [chatId]);

    const abort = async () => {
      if (isStreaming) {
        try {
          await backendApiFetch('/ai/abort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          handleStop?.();
        } catch (error) {
          logger.error('Error during abort:', error);
          handleStop?.();
        }
      }
    };

    /**
     * Keep an eye on transcript changes for debugging
     */
    useEffect(() => {
      logger.debug('Transcript from speech:', transcript);
    }, [transcript]);

    useEffect(() => {
      localStorage.removeItem('projectUrl');
      localStorage.removeItem('annonKey');

      // Setup speech recognition
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }

      // Clear the input
      if (handleInputChange) {
        const syntheticEvent = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        handleInputChange(syntheticEvent);
      }
    }, []);

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);

        // If speech recognition is active, abort it
        if (recognition) {
          recognition.abort();
          setTranscript('');
          setIsListening(false);

          // Clear the input
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = async (e) => {
            const base64Image = e.target?.result as string;

            // Validate & re-encode image
            const img = new Image();

            img.onload = () => {
              let width = img.width;
              let height = img.height;
              const aspectRatio = img.width / img.height;
              const isVerticalImage = aspectRatio < 0.5 && img.height > 4000;

              const MAX_WIDTH = 1920;
              const MAX_HEIGHT = isVerticalImage ? 7500 : 1080;

              if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                if (isVerticalImage) {
                  const ratio = MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                  width = width * ratio;
                } else {
                  const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                  width = width * ratio;
                  height = height * ratio;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');

              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                let quality = 1;
                const originalSize = file.size;

                if (originalSize > 8000000) {
                  quality = 0.8;
                } else if (originalSize > 4000000) {
                  quality = 0.9;
                }

                const processedImage = canvas.toDataURL('image/jpeg', quality);

                setUploadedFiles?.([...uploadedFiles, file]);
                setImageDataList?.([...imageDataList, processedImage]);
              }
            };

            img.onerror = (error) => {
              console.error('Error processing image:', error);
            };

            img.src = base64Image;
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
              const base64Image = e.target?.result as string;

              // Validate & re-encode image
              const img = new Image();

              img.onload = () => {
                let width = img.width;
                let height = img.height;
                const aspectRatio = img.width / img.height;
                const isVerticalImage = aspectRatio < 0.5 && img.height > 4000;

                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = isVerticalImage ? 7500 : 1080;

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                  if (isVerticalImage) {
                    const ratio = MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                    width = width * ratio;
                  } else {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = width * ratio;
                    height = height * ratio;
                  }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

                if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';

                  ctx.drawImage(img, 0, 0, width, height);

                  let quality = 1;
                  const originalSize = file.size;

                  if (originalSize > 8000000) {
                    quality = 0.8;
                  } else if (originalSize > 4000000) {
                    quality = 0.9;
                  }

                  const processedImage = canvas.toDataURL('image/jpeg', quality);

                  setUploadedFiles?.([...uploadedFiles, file]);
                  setImageDataList?.([...imageDataList, processedImage]);
                }
              };

              img.onerror = (error) => {
                console.error('Error processing image:', error);
              };
              img.src = base64Image;
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const handleCleanUp = () => {
      if (isStreaming) {
        return;
      }

      setCleaningProject(true);

      const cleanUpPrompt =
        'Clean up the project by ensuring no single file exceeds 300 lines of code. Refactor large files into smaller, modular components while maintaining full functionality. Identify and remove all unused files, code, components, and any redundant data that are no longer needed. Ensure that all components remain properly connected and functional, avoiding any disruptions to the existing system. Maintain code integrity by verifying that no changes introduce errors or break current features. The goal is to optimize the project for efficiency, maintainability, and clarity.';
      sendMessage?.({} as React.UIEvent, cleanUpPrompt);
    };

    const handleChecklist = () => {
      if (isStreaming) {
        return;
      }

      setCheckingList(true);

      const checklistPrompt =
        'Look at my initial prompt, understand the goal point by point and build for me a checklist with a green check for everything what has been done and with a red check what has left to be done.';
      sendMessage?.({} as React.UIEvent, checklistPrompt);
    };

    const { mode } = useStore(chatStore);

    const placeholderText =
      mode === 'code'
        ? 'If you can imagine it, BIELA can code it, what shall we do today?'
        : 'How can I help you today? Let’s do something amazing together';

    const baseChat = (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          `relative flex h-full w-full overflow-hidden
          ${chatStarted ? 'chat-style-apply' : ''}`,
        )}
        data-chat-visible={showChat}
      >
        {/* @ts-ignore */}
        <ClientOnly>{() => <Menu isStreaming={isStreaming} />}</ClientOnly>
        {!chatStarted && <img className={'sky-absolute'} src={NewBgBiela} alt="" />}
        <div
          ref={scrollRef}
          className={`flex flex-col lg:flex-row overflow-y-auto w-full h-full ${!chatStarted ? 'lg:flex-row' : ''}`}
        >
          <div
            style={{ zIndex: '1', margin: '0' }}
            className={classNames(
              styles.Chat,
              chatStarted ? '' : styles.chatbg,
              'overflow-y-auto flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full justify-between entire-chat',
            )}
          >
            {!chatStarted && (
              <div style={{ zIndex: '1' }} id="intro" className="max-w-chat mx-auto text-center px-4 lg:px-0">
                <h1
                  className={classNames(
                    styles.textWeight,
                    'sm:text-[20px]  md:text-[28px] tracking-[-5.6px] text-biela-elements-textPrimary mb-4 animate-fade-in whitespace-nowrap',
                  )}
                >
                  WHAT DO YOU WANT TO CREATE?
                </h1>
                <p className="sm:text-[10px] md:text-[12px] light-text-[#2A2A2A] lg:text-[14px] tracking-[1px] sm:tracking-[1.5px] md:tracking-[2px] lg:tracking-[2.5px] xl:tracking-[3px] text-biela-elements-textSecondary animate-fade-in animation-delay-200">
                  Bring your ideas to life—prompt, run, edit, and deploy full-stack web & mobile applications
                  effortlessly.
                </p>
              </div>
            )}
            <div className={classNames('padding-border-chat', { 'h-full flex flex-col': chatStarted })}>
              <ClientOnly>
                {() =>
                  chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat mx-auto z-1 gap-messages base-response"
                      isStreaming={isStreaming}
                      messages={messages}
                      isTyping={true}
                    />
                  ) : null
                }
              </ClientOnly>

              <ClientOnly>
                {() => (
                  <div
                    style={{ zIndex: '1', '--rotaion-variable': `${rotation}deg` }}
                    className={classNames(
                      `${(actionAlert?.type === 'preview' || actionAlert?.type === 'migration' || actionAlert?.type === 'error') && 'chat-on-error'} backdrop-blur-[15px] transition-all flex flex-col place-items-center align-items-center justify-center rounded-lg relative w-full max-w-chat mx-auto z-prompt base-chat`,
                      {
                        'sticky bottom-2': chatStarted,
                        'chat-mode': mode === 'chat', // Add the chat-mode class when chat is active
                      },
                    )}
                  >
                    {/*<div className={'loop-border'}></div>*/}
                    {chatStarted && <TokenRemaining isStreaming={isStreaming} />}
                    <div className={classNames(styles.containerUnitTesting, 'w-full')}>
                      {((actionAlert?.type === 'error' && isStreaming) || (actionAlert?.type === 'preview' && isStreaming) || actionAlert?.type === 'migration') && (
                        <ChatAlert
                          alert={actionAlert}
                          clearAlert={() => clearAlert?.()}
                          postMessage={(message) => {
                            sendMessage?.({} as React.UIEvent, message);
                            clearAlert?.();
                          }}
                        />
                      )}
                      {actionAlert?.type === 'unitTesting' && !isStreaming && (
                        <ChatSuggestion
                          title={'Suggestion'}
                          message={'Would you like to Run Unit Tests for you project?'}
                          primaryButtonText={'Run Unit Tests'}
                          secondaryButtonText={'Dismiss'}
                          clearAlert={() => clearAlert?.()}
                          postMessage={() => {
                            sendMessage?.({} as React.UIEvent, 'Run Unit Tests for my Project');
                            clearAlert?.();
                          }}
                        />
                      )}
                      {actionAlert?.type === 'database' && !isStreaming && (
                        <ChatSuggestion
                          title={'Database Creation'}
                          message={'Would you like to create a database for your project?'}
                          primaryButtonText={'Create Database'}
                          secondaryButtonText={'Dismiss'}
                          clearAlert={() => clearAlert?.()}
                          postMessage={() => {
                            sendMessage?.({} as React.UIEvent, 'Create a database for my project');
                            clearAlert?.();
                          }}
                        />
                      )}
                    </div>
                    <div className="w-100% h-full rotate-full">
                      <FilePreview
                        files={uploadedFiles}
                        imageDataList={imageDataList}
                        onRemove={(index) => {
                          setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
                          setImageDataList?.(imageDataList.filter((_, i) => i !== index));
                        }}
                      />
                      <ClientOnly>
                        {() => (
                          <ScreenshotStateManager
                            setUploadedFiles={setUploadedFiles}
                            setImageDataList={setImageDataList}
                            uploadedFiles={uploadedFiles}
                            imageDataList={imageDataList}
                          />
                        )}
                      </ClientOnly>

                      {/* The prompt textarea + send button */}
                      <div
                        className={classNames(
                          `relative container-chat-bg transition-all ${!showPrompt ? 'show-prompt' : 'hide-prompt'}`,
                        )}
                      >
                        <div className="flex justify-between items-center top-header-prompt text-sm p-3 shadow-xs border-b border-biela-elements-borderColor max-sm:flex-wrap max-sm:gap-2">
                          <ChatCodeSwitch />
                          <div className={'flex gap-[6px] items-center'}>
                            <WithTooltip tooltip={checkingList ? 'Checking the features' : 'Checklists'}>
                              <button
                                className="px-2 py-1 gap-[6px] items-center"
                                style={{ backgroundColor: 'transparent', display: chatStarted ? 'flex' : 'none' }}
                                onClick={handleChecklist}
                              >
                                <CheckList checked={checkingList} />
                                <span className={'text-white font-light'}>
                                  {checkingList ? 'Checking the features' : 'Checklists'}
                                </span>
                              </button>
                            </WithTooltip>
                            {chatStarted && (
                              <WithTooltip tooltip={`${!showPrompt ? 'Hide Prompt' : 'Show Prompt'}`}>
                                <button
                                  style={{
                                    backgroundImage: 'linear-gradient(180deg, #010101 57.32%, #161616 100%)',
                                  }}
                                  className="p-[4px] border rounded-full border-[#2E2E2E] flex items-center"
                                  onClick={() => {
                                    setShowPrompt(!showPrompt);
                                  }}
                                >
                                  <p
                                    className={`${!showPrompt ? 'i-ph:caret-down' : 'i-ph:caret-up'} min-w-[14px] min-h-[14px] bg-white`}
                                  ></p>
                                </button>
                              </WithTooltip>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={8}
                          ref={textareaRef}
                          className={classNames(
                            'w-full p-[24px] outline-none resize-none text-biela-elements-textPrimary placeholder-biela-elements-textTertiary bg-transparent text-sm chat-textarea-font',
                            'transition-all duration-200',
                            'hover:border-biela-elements-focus',
                          )}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.border = '2px solid #1488fc';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.border = '2px solid #1488fc';
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.border = '1px solid var(--biela-elements-borderColor)';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.border = '1px solid var(--biela-elements-borderColor)';

                            const files = Array.from(e.dataTransfer.files);
                            files.forEach((file) => {
                              if (file.type.startsWith('image/')) {
                                const reader = new FileReader();

                                reader.onload = async (e) => {
                                  const base64Image = e.target?.result as string;
                                  const img = new Image();

                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = img.width;
                                    canvas.height = img.height;

                                    const ctx = canvas.getContext('2d');

                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0);

                                      const processedImage = canvas.toDataURL(file.type, 1.0);
                                      setUploadedFiles?.([...uploadedFiles, file]);
                                      setImageDataList?.([...imageDataList, processedImage]);
                                    }
                                  };

                                  img.onerror = (error) => {
                                    console.error('Error processing image:', error);
                                  };
                                  img.src = base64Image;
                                };
                                reader.readAsDataURL(file);
                              }
                            });
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              if (event.shiftKey) {
                                return;
                              }

                              event.preventDefault();

                              if (isStreaming) {
                                handleStop?.();
                                return;
                              }

                              if (event.nativeEvent.isComposing) {
                                return;
                              }

                              handleSendMessage?.(event);
                            }
                          }}
                          value={input}
                          onKeyDownCapture={(event) => {
                            if (event.key === 'Enter' && isStreaming) {
                              event.preventDefault();
                              event.stopPropagation();

                              return;
                            }
                          }}
                          onChange={(event) => {
                            handleInputChange?.(event);
                          }}
                          onPaste={handlePaste}
                          style={{
                            minHeight: TEXTAREA_MIN_HEIGHT,
                            maxHeight: TEXTAREA_MAX_HEIGHT,
                          }}
                          placeholder={placeholderText}
                          translate="no"
                        />

                        {/* Footer row under the textarea */}
                        <div className="flex justify-between items-center text-sm p-3 prompt-actions-button shadow-xs border-t border-biela-elements-borderColor h-[56px]">
                          <div className="flex max-sm:gap-[8px] max-sm:w-full gap-3 items-center">
                            <div className={'flex gap-3 items-center'}>
                              <IconButton
                                title="Upload file"
                                className="transition-all"
                                onClick={() => handleFileUpload()}
                              >
                                <WithTooltip tooltip="Upload">
                                  <div className="light:hidden">
                                    <FileIcon />
                                  </div>
                                </WithTooltip>
                                <div className="dark:hidden">
                                  <FileIcon fill="black" />
                                </div>
                              </IconButton>

                              <SpeechRecognitionButton
                                isListening={isListening}
                                onStart={startListening}
                                onStop={stopListening}
                                disabled={isStreaming}
                              />

                              <WithTooltip tooltip="Enhance Prompting">
                                <button
                                  className="hover-magic-effect"
                                  style={{ backgroundColor: 'transparent' }}
                                  disabled={input.length === 0 || enhancingPrompt}
                                  onClick={() => {
                                    enhancePrompt?.();
                                    toast.success('Prompt enhanced!');
                                  }}
                                >
                                  <img src={MagicIcon} alt="Magic update" />
                                </button>
                              </WithTooltip>

                              <WithTooltip tooltip={cleaningProject ? 'Cleaning the project' : 'Clean Up Project'}>
                                <button
                                  className="hover-magic-effect flex gap-[6px] items-center"
                                  style={{ backgroundColor: 'transparent', display: chatStarted ? 'flex' : 'none' }}
                                  onClick={handleCleanUp}
                                >
                                  <img src={CleanUpIcon} alt="Clean Up Project" />
                                  {cleaningProject && chatStarted && (
                                    <span className={'font-light color-white'}>Cleaning the project</span>
                                  )}
                                </button>
                              </WithTooltip>
                            </div>
                          </div>
                          <ClientOnly>
                            {() => (
                              <SendButton
                                show={!!input.length || isStreaming || !!uploadedFiles.length}
                                isStreaming={isStreaming}
                                disabled={isStreaming}
                                onClick={(event) => {
                                  if (isStreaming) {
                                    abort();
                                    return;
                                  }

                                  if (input.length || uploadedFiles.length) {
                                    handleSendMessage?.(event);
                                  }
                                }}
                                type={!isStreaming ? 'send' : 'cancel'}
                              />
                            )}
                          </ClientOnly>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ClientOnly>
            </div>
            {/* Example prompts, import buttons, etc. */}
            {!chatStarted &&
              ExamplePrompts((event, messageInput) => {
                if (isStreaming) {
                  handleStop?.();
                  return;
                }

                handleSendMessage?.(event, messageInput);
              })}
            {!chatStarted && <CopyRighting />}
          </div>

          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);
