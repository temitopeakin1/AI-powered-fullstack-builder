/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { useStore } from '@nanostores/react';
import type { JSONValue, Message } from 'ai';
import { useChat } from 'ai/react';
import React, { memo, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnimate } from 'framer-motion';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useSettings } from '~/ai/lib/hooks/useSettings';
import { description, useChatHistory } from '~/ai/lib/persistence';
import { chatStore, setIsStreaming } from '~/ai/lib/stores/chat';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { PROMPT_COOKIE_KEY } from '~/utils/constants';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';
import Cookies from 'js-cookie';
import { debounce } from '~/utils/debounce';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/ai/lib/hooks';
import { useSearchParams } from '@remix-run/react';
import { createSampler } from '~/utils/sampler';
import { getTemplates, selectStarterTemplate } from '~/utils/selectStarterTemplate';
import { FluidAnimation } from './FluidAnimation';
import '~/ai/styles/fluid-animation.css';
import '~/components/styles/index.scss?url';
import { logStore } from '~/ai/lib/stores/logs';
import ignore from 'ignore';
import { Header } from '~/components/common/Header/Header';
import { uploadChatMessages } from '~/ai/lib/stores/projects/chat';
import { backendApiFetch } from '~/ai/lib/backend-api';

interface FileData {
  type: 'file' | 'folder';
  content: string;
}

interface FileStructure {
  [key: string]: FileData;
}

function processImportFiles(
  fileStructure: FileStructure,
  rootPath = '/home/project',
  ignorePatterns: string[] = [],
): string {
  const includedFiles: [string, FileData][] = [];
  const ignoredFileList: string[] = [];

  // Initialize ignore object with patterns
  const ig = ignore().add(ignorePatterns);

  // Iterate through file structure and handle ignored and included files
  for (const [filePath, fileData] of Object.entries(fileStructure)) {
    // Extract the relative file path and remove leading slash if present
    let relativePath = filePath.replace(rootPath + '/', '');

    // Ensure no leading slash before the file name
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    // Handle ignored files using the ignore package
    if (ig.ignores(relativePath)) {
      ignoredFileList.push(relativePath);
      continue;
    }

    // Exclude folders
    if (fileData.type === 'folder') {
      continue;
    }

    // Include valid files with simplified paths
    includedFiles.push([relativePath, fileData]);
  }

  // Build the output message
  let outputMessage =
    '# Project Files\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n';

  for (const [file, fileData] of includedFiles) {
    outputMessage += `${file}:\n`;
    outputMessage += `\`\`\`\n${fileData.content}\n\`\`\`\n\n`;
  }

  // Add ignored files list
  if (ignoredFileList.length > 0) {
    outputMessage += 'Here is a list of files that exist on the file system but are not being shown to you:\n\n';

    for (const file of ignoredFileList) {
      outputMessage += `  - ${file}\n`;
    }
  }

  return outputMessage;
}

function generateFileChangesMessage(
  initialFiles: FileStructure,
  currentFiles: FileStructure,
  ignorePatterns: string[] = [],
  rootPath: string = '/home/project',
): string {
  let fileChangesMessage = '# File Changes\n\n';
  fileChangesMessage += 'Here is a list of all files that have been modified since the start of the conversation.\n';
  fileChangesMessage += 'This information serves as the true contents of these files!\n\n';
  fileChangesMessage +=
    'The contents include either the full file contents or a diff (when changes are smaller and localized).\n\n';
  fileChangesMessage += 'Use it to:\n';
  fileChangesMessage += ' - Understand the latest file modifications\n';
  fileChangesMessage += ' - Ensure your suggestions build upon the most recent version of the files\n';
  fileChangesMessage += ' - Make informed decisions about changes\n';
  fileChangesMessage += ' - Ensure suggestions are compatible with existing code\n\n';

  // Initialize ignore object with patterns
  const ig = ignore().add(ignorePatterns);

  const isIgnored = (relativeFilePath: string, entryType: string) => {
    // Exclude ignored files and folders using the ignore package
    return ig.ignores(relativeFilePath) || entryType === 'folder';
  };

  // Case when initialFileStructure is empty
  if (Object.keys(initialFiles).length === 0) {
    for (const [filePath, fileData] of Object.entries(currentFiles)) {
      const relativeFilePath = filePath.replace(rootPath + '/', '');

      // Skip ignored files or folders
      if (isIgnored(relativeFilePath, fileData.type)) {
        continue;
      }

      fileChangesMessage += `${relativeFilePath}:\n`;
      fileChangesMessage += '```\n' + fileData.content + '\n```\n\n';
    }
  } else {
    for (const [filePath, currentFileData] of Object.entries(currentFiles)) {
      const initialFileData = initialFiles[filePath];
      const relativeFilePath = filePath.replace(rootPath + '/', '');

      // Skip ignored files or folders
      if (isIgnored(relativeFilePath, currentFileData.type)) {
        continue;
      }

      if (!initialFileData) {
        // New file
        fileChangesMessage += `${relativeFilePath}:\n`;
        fileChangesMessage += '```\n' + currentFileData.content + '\n```\n\n';
      } else if (initialFileData.content !== currentFileData.content) {
        // Modified file
        fileChangesMessage += `${relativeFilePath}:\n`;
        fileChangesMessage += '```\n' + currentFileData.content + '\n```\n\n';
      }
    }
  }

  return fileChangesMessage;
}

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

export function Chat() {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory, importChat, exportChat } = useChatHistory();
  const title = useStore(description);
  useEffect(() => {
    workbenchStore.setReloadedMessages(initialMessages.map((m) => m.id));
  }, [initialMessages]);

  return (
    <>
      {ready && (
        <ChatImpl
          description={title}
          initialMessages={initialMessages}
          storeMessageHistory={storeMessageHistory}
          importChat={importChat}
          exportChat={exportChat}
        />
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={toastAnimation}
      />
    </>
  );
}

const processSampledMessages = createSampler(
  (options: {
    messages: Message[];
    initialMessages: Message[];
    isLoading: boolean;
    parseMessages: (messages: Message[], isLoading: boolean) => void;
    storeMessageHistory: (messages: Message[]) => Promise<void>;
  }) => {
    const validateAndFixMessages = (messages: Message[]) => {
      return messages.map((message, index) => {
        if (message.role !== 'assistant' || index === messages.length - 1) {
          return message;
        }

        let content = message.content;

        const actionOpenTags = content.match(/<bielaAction\b[^>]*>/g) || [];
        const actionCloseTags = content.match(/<\/bielaAction>/g) || [];
        const artifactOpenTags = content.match(/<bielaArtifact\b[^>]*>/g) || [];
        const artifactCloseTags = content.match(/<\/bielaArtifact>/g) || [];

        const actionOpenCount = actionOpenTags.length;
        const actionCloseCount = actionCloseTags.length;
        const artifactOpenCount = artifactOpenTags.length;
        const artifactCloseCount = artifactCloseTags.length;

        if (actionOpenCount > actionCloseCount) {
          content += '\n</bielaAction>'.repeat(actionOpenCount - actionCloseCount);

          if (artifactOpenCount > artifactCloseCount) {
            content += '\n</bielaArtifact>'.repeat(artifactOpenCount - artifactCloseCount);
          }
        }

        return {
          ...message,
          content,
        };
      });
    };

    const { messages, initialMessages, isLoading, parseMessages, storeMessageHistory } = options;
    parseMessages(validateAndFixMessages(messages), isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(validateAndFixMessages(messages)).catch((error) => toast.error(error.message));
    }
  },
  50,
);

interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
  importChat: (description: string, messages: Message[]) => Promise<void>;
  exportChat: () => void;
  description?: string;
}

export const ChatImpl = memo(
  ({ description, initialMessages, storeMessageHistory, importChat, exportChat }: ChatProps) => {
    useShortcuts();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [chatStarted, setChatStarted] = useState(initialMessages?.length > 0 || false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Move here
    const [imageDataList, setImageDataList] = useState<string[]>([]); // Move here
    const [searchParams, setSearchParams] = useSearchParams();
    const [fakeLoading, setFakeLoading] = useState(false);
    const files = useStore(workbenchStore.files);
    const actionAlert = useStore(workbenchStore.alert);
    const { promptId, autoSelectTemplate, contextOptimizationEnabled } = useSettings();
    const { showChat } = useStore(chatStore);
    const [animationScope, animate] = useAnimate();
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
    const { parsedMessages, parseMessages } = useMessageParser();

    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    const customUseChatFetch = async (_: RequestInfo | URL, init?: RequestInit<CfProperties>) => {
      return backendApiFetch('/ai/stream', init);
    };

    const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
      fetch: customUseChatFetch,
      body: {
        files,

        // promptId,
        mode: chatStore.get().mode,
        contextOptimization: contextOptimizationEnabled,
        projectSlug: workbenchStore.getSlug(),
      },
      sendExtraMessageFields: true,
      onError: (error) => {
        logger.error('Request failed\n\n', error);
        toast.error(
          'There was an error processing your request: ' + (error.message ? error.message : 'No details were returned'),
        );
      },
      onFinish: (message, response) => {
        const usage = response?.usage;

        if (usage) {
          logger.debug('Token usage:', usage);

          // You can now use the usage data as needed
        }

        logger.debug('Finished streaming');
      },
      initialMessages,
      initialInput: Cookies.get(PROMPT_COOKIE_KEY) || '',
    });

    const filterMessages = (messages: Message[]) =>
      messages.reduce(
        (acc, message, index) => {
          if (message.role === 'assistant') {
            // Only keep the latest assistant message
            const isLastAssistant = !messages.slice(index + 1).some((m) => m.role === 'assistant');

            if (isLastAssistant) {
              const lastUserMessageIndex = acc.filter((m) => m.role === 'user').length;
              acc.push({
                role: message.role,
                content: `Assistant Response to Message #${lastUserMessageIndex}:\n\n${message.content}`,
                id: message.id,
              });
            }
          } else {
            // Transform user messages
            const currentIndex = acc.filter((m) => m.role === 'user').length + 1;
            const isLastUser = !messages.slice(index + 1).some((m) => m.role === 'user');
            const modifiedContent = Array.isArray(message?.content)
              ? message.content.map((contentItem: { type: string; text: string }) => {
                  if (contentItem.type === 'text') {
                    return {
                      ...contentItem,
                      text:
                        contentItem.text.replace('Current Message:\n\n', `Previous Message #${currentIndex}:\n\n`) +
                        (isLastUser ? '\n\n(Assistant response below)' : '\n\n(Assistant response omitted)'),
                    };
                  }

                  return contentItem;
                })
              : [];

            acc.push({
              role: message.role,
              content: modifiedContent,
              id: message.id,
            });
          }

          return acc;
        },
        [] as { role: string; id: string; content: string | { type: string; text: string }[] }[],
      );

    useMemo(() => {
      if (initialMessages.length === messages.length) {
        return;
      }

      uploadChatMessages(messages).then();
    }, [messages.length]);

    useEffect(() => {
      // Changed this from 'prompt' to 'chat-prompt' because google oauth returned a 'prompt' query and it would open up the chat, sending gibberish to the llm
      const prompt = searchParams.get('chat-prompt');

      if (!prompt) {
        return;
      }

      setSearchParams({});
      runAnimation();
      append({
        role: 'user',
        content: [
          {
            type: 'text',

            // [Model: ${model}]\n\n[Provider: ${provider.name}]\n\n
            text: `${prompt}`,
          },
        ] as any, // Type assertion to bypass compiler check
      });
    }, [searchParams]);

    useEffect(() => {
      chatStore.setKey('started', !!initialMessages.length);

      const storedApiKeys = Cookies.get('apiKeys');

      if (!storedApiKeys) {
        return;
      }

      setApiKeys(JSON.parse(storedApiKeys));
    }, []);

    useMemo(() => {
      setIsStreaming(isLoading);
    }, [isLoading]);

    useEffect(() => {
      processSampledMessages({
        messages,
        initialMessages,
        isLoading,
        parseMessages,
        storeMessageHistory,
      });
    }, [JSON.stringify(messages), isLoading, parseMessages]);

    useMemo(() => {
      const textarea = textareaRef.current;

      if (textarea) {
        textarea.style.height = 'auto';

        const scrollHeight = textarea.scrollHeight;

        textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
        textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
      }
    }, [input, textareaRef]);

    useEffect(() => {
      if (!actionAlert) {
        return () => void 0;
      }

      // Run and store timeouts for cleanup
      const logTimeout = ingestErrorLogs(actionAlert);
      const fixErrorTimeout = tryToFixError(actionAlert);

      return () => {
        clearTimeout(logTimeout);

        // Only clear fixErrorTimeout if it’s truthy
        if (fixErrorTimeout) {
          return;
        }

        clearTimeout(fixErrorTimeout);
      };
    }, [actionAlert]);

    const scrollTextArea = () => {
      const textarea = textareaRef.current;

      if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    };

    const abort = () => {
      stop();
      chatStore.setKey('aborted', true);
      workbenchStore.abortAllActions();
    };

    const runAnimation = async () => {
      if (chatStarted) {
        return;
      }

      await Promise.all([
        animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }),
        animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }),
      ]);

      chatStore.setKey('started', true);

      setChatStarted(true);
    };

    const initialImportRef = useRef<File[] | null>(null);

    const sendMessage = async (_event: UIEvent, messageInput?: string, messageOptions?: JSONValue) => {
      const _input = messageInput || input;

      if (_input.length === 0 || isLoading) {
        return;
      }

      /**
       * @note (delm) Usually saving files shouldn't take long but it may take longer if there
       * many unsaved files. In that case we need to block user input and show an indicator
       * of some kind so the user is aware that something is happening. But I consider the
       * happy case to be no unsaved files and I would expect users to save their changes
       * before they send another message.
       */
      await workbenchStore.saveAllFiles();

      const fileModifications = workbenchStore.getFileModifcations();

      chatStore.setKey('aborted', false);

      runAnimation();

      if (!chatStarted && messageInput && autoSelectTemplate) {
        setFakeLoading(true);
        setMessages([
          {
            id: `${new Date().getTime()}`,
            role: 'user',
            content: [
              {
                type: 'text',

                // [Model: ${model}]\n\n[Provider: ${provider.name}]
                text: `${_input}`,
              },
              ...imageDataList.map((imageData) => ({
                type: 'image',
                image: imageData,
              })),
            ] as any, // Type assertion to bypass compiler check
          },
        ]);

        // reload();

        const { template, title } = await selectStarterTemplate({
          message: messageInput,
        });

        if (template !== 'blank') {
          const temResp = await getTemplates(template, title).catch((e) => {
            if (e.message.includes('rate limit')) {
              toast.warning('Rate limit exceeded. Skipping starter template\n Continuing with blank template');
            } else {
              toast.warning('Failed to import starter template\n Continuing with blank template');
            }

            return null;
          });

          if (temResp) {
            const { assistantMessage, userMessage } = temResp;

            setMessages([
              {
                id: `${new Date().getTime()}`,
                role: 'user',
                content: messageInput,

                // annotations: ['hidden'],
              },
              {
                id: `${new Date().getTime()}`,
                role: 'assistant',
                content: assistantMessage,
              },
              {
                id: `${new Date().getTime()}`,
                role: 'user',

                // [Model: ${model}]\n\n[Provider: ${provider.name}]\n\n
                content: `${userMessage}`,
                annotations: ['hidden'],
              },
            ]);

            reload();
            setFakeLoading(false);

            return;
          } else {
            setMessages([
              {
                id: `${new Date().getTime()}`,
                role: 'user',
                content: [
                  {
                    type: 'text',

                    // [Model: ${model}]\n\n[Provider: ${provider.name}]\n\n
                    text: `${_input}`,
                  },
                  ...imageDataList.map((imageData) => ({
                    type: 'image',
                    image: imageData,
                  })),
                ] as any, // Type assertion to bypass compiler check
              },
            ]);
            reload();
            setFakeLoading(false);

            return;
          }
        } else {
          setMessages([
            {
              id: `${new Date().getTime()}`,
              role: 'user',
              content: [
                {
                  type: 'text',

                  // [Model: ${model}]\n\n[Provider: ${provider.name}]\n\n
                  text: `${_input}`,
                },
                ...imageDataList.map((imageData) => ({
                  type: 'image',
                  image: imageData,
                })),
              ] as any, // Type assertion to bypass compiler check
            },
          ]);
          reload();
          setFakeLoading(false);

          return;
        }
      }

      // Store files on the first call
      if (!initialImportRef.current) {
        initialImportRef.current = files;
      }

      // Define ignored paterns
      const ignorePatterns = [
        'node_modules/**',
        '.git/**',
        '.github/**',
        '.vscode/**',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.png',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '.cache/**',
        '.vscode/**',
        '.idea/**',
        '**/*.log',
        '**/.DS_Store',
        '**/npm-debug.log*',
        '**/yarn-debug.log*',
        '**/yarn-error.log*',
        '**/*lock.json',
        '**/*lock.yaml',
      ];

      const importFiles = {
        role: 'user',
        id: 'imported-files',
        content: [
          {
            type: 'text',
            text: processImportFiles(initialImportRef.current, 'home/project', ignorePatterns),
          },
        ],
      };

      const changedFiles = {
        role: 'user',
        id: 'changed-files',
        content: [
          {
            type: 'text',
            text: generateFileChangesMessage(initialImportRef.current, files, ignorePatterns),
          },
        ],
      };

      const designPrompt = {
        role: 'user',
        id: 'design-instruct',
        content: [
          {
            type: 'text',
            text: 'For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nUse relevant stock photos from pexels where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.',
          },
        ],
      };

      const fileRule = {
        role: 'user',
        id: 'file-creation-rule',
        content: [
          {
            type: 'text',
            text: 'When creating files for a project, you MUST follow these critical rules:\n\n0. React Project Requirements:\n- ALWAYS import React in EVERY file that uses JSX/TSX: `import React from "react";`\n- NEVER assume React is globally available - always import it explicitly\n- Create ALL configuration files (vite.config.js, postcss.config.js, tailwind.config.js) AND index.html\n\n1. File Dependencies:\n- ALWAYS analyze dependencies between files before starting to write them\n- Create files in dependency order - dependencies must be created before files that import them\n- For React\next.js projects, create shared components, utilities, and hooks BEFORE files that use them\n- Create configuration files (package.json, tsconfig.json, etc.) FIRST\n\n2. Component Dependencies:\n- Create base/shared components before composite components that use them\n- Create utility functions and hooks before components that use them\n- Create context providers before components that consume them\n\n3. File Organization:\n- Group related files together (e.g., components with their styles)\n- Create parent components before child components\n- Create layout components before page components\n\n4. Import Resolution:\n- Ensure all imported files exist before creating a file that imports them\n- Use consistent import paths (prefer absolute imports with path aliases)\n- Create all necessary type definitions before files that use them\n\n5. Configuration Priority:\n- Create package.json with all dependencies first\n- Create TypeScript/JavaScript configuration files next\n- Create styling configuration files (Tailwind, CSS modules) after\n- Create routing configuration last\n\n6. Testing Files:\n- Create test utilities before test files\n- Create mock data files before tests that use them\n- Create test files after their corresponding implementation files\n\nCRITICAL: NEVER create a file that imports from non-existent files. Always create dependencies first!',
          },
        ],
      };

      const instructionMessage = {
        role: 'user',
        id: 'instruct',
        content: [
          {
            type: 'text',
            text: 'Make sure to build the application using React + Vite + JavaScript ONLY if the imported-files message above contains no imported files and no other technology is requested by the user.\n\nBelow is the conversation history, including all previous messages along with the most recent assistant response. Please reference this context to inform your future responses and maintain conversation continuity.',
          },
        ],
      };

      const copyrightMessage = {
        role: 'user',
        id: 'copyright-footer',
        content: [
          {
            type: 'text',
            text: "When first creating a website, handle the copyright bar at the bottom of the footer as follows:\n\n1. If the user has specifically requested copyright content:\n- Implement only the user-requested copyright elements\n- Format them to blend naturally with the footer design\n\n2. If the user has NOT specified any copyright content:\n- Include a slim copyright bar (instead of any default copyright notice) at the very bottom that blends naturally with the footer design\n- This bar should be visually distinct but subtle, vertically compact with minimal padding ensuring it integrates harmoniously with the overall footer style\n- The copyright bar should contain the text: 'AI-powered development by Biela.dev, powered by TeachMeCode® Institute' in a way that complements the footer's typography and layout\n- Ensure it adapts seamlessly to the website's design language\n\nDo not include 'AI-powered development by Biela.dev, powered by TeachMeCode® Institute' if the user has provided their own copyright content - they are mutually exclusive.",
          },
        ],
      };

      const languageRespond = {
        role: 'user',
        id: 'language-instruct',
        content: [
          {
            type: 'text',
            text: 'Ensure your response matches the language of the given input.',
          },
        ],
      };

      const newMessage = {
        role: 'user',
        content: [
          {
            type: 'text',

            // [Model: ${model}]\n\n[Provider: ${provider.name}]\n\n
            text: `Current Message:\n\n${_input}`,
          },
          ...imageDataList.map((imageData) => ({
            type: 'image',
            image: imageData,
          })),
        ],
        data: messageOptions,
      };

      const supabaseMessage = {
        role: 'user',
        id: 'instruct',
        content: [
          {
            type: 'text',
            text: ` User is connected to Supabase: following the Mandatory Sequence is your core role now when dealing with databases. Use supabase connection credentials provided by user Project URL: ${localStorage.getItem('projectUrl')}, Anon Key: ${localStorage.getItem('annonKey')}`
          }
        ]
      } as any;

      const hasSupabaseCredentials = localStorage.getItem('projectUrl') && localStorage.getItem('annonKey');


      // Filter existing messages and add the import files at the start and the new message at the end
      const hasData =
        (initialImportRef.current && Object.keys(initialImportRef.current).length > 0) ||
        (files && Object.keys(files).length > 0);

      const filteredMessages = [
        ...(chatStore.get().mode === 'code' || hasData ? [importFiles, changedFiles] : []),
        ...(chatStore.get().mode === 'code' ? [designPrompt, fileRule, instructionMessage, languageRespond] : []),
        ...(chatStore.get().mode === 'chat' || hasData ? [] : [copyrightMessage]),
        ...(hasSupabaseCredentials ? [supabaseMessage] : []),
        ...filterMessages(messages),
        newMessage,
      ];

      append(newMessage as Message, { body: { messages: filteredMessages } });

      if (fileModifications !== undefined) {
        /**
         * If we have file modifications we append a new user message manually since we have to prefix
         * the user input with the file modifications and we don't want the new user input to appear
         * in the prompt. Using `append` is almost the same as `handleSubmit` except that we have to
         * manually reset the input and we'd have to manually pass in file attachments. However, those
         * aren't relevant here.
         */

        /**
         * After sending a new message we reset all modifications since the model
         * should now be aware of all the changes.
         */
        workbenchStore.resetAllFileModifications();
      }

      setInput('');
      Cookies.remove(PROMPT_COOKIE_KEY);

      // Add file cleanup here
      setUploadedFiles([]);
      setImageDataList([]);

      resetEnhancer();

      textareaRef.current?.blur();
    };

    useEffect(() => {

      const justConnected = localStorage.getItem('justConnectedSupabase');
      if (justConnected === 'true') {
        localStorage.removeItem('justConnectedSupabase');

        setTimeout(() => {
          workbenchStore.actionAlert.set({
            type: 'database',
            title: 'Database Creation',
            description: 'Would you like to create a database for your project?',
            content: 'Content',
            source: 'preview'
          });
        }, 1000);
      }
    }, []);

    /**
     * Handles the change event for the textarea and updates the input state.
     * @param event - The change event from the textarea.
     */
    const onTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleInputChange(event);
    };

    /**
     * Debounced function to cache the prompt in cookies.
     * Caches the trimmed value of the textarea input after a delay to optimize performance.
     */
    const debouncedCachePrompt = useCallback(
      debounce((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const trimmedValue = event.target.value.trim();
        Cookies.set(PROMPT_COOKIE_KEY, trimmedValue, { expires: 30 });
      }, 1000),
      [],
    );

    const [messageRef, scrollRef] = useSnapScroll();

    function ingestErrorLogs(actionAlert: any) {
      return setTimeout(() => {
        const projectSlug = workbenchStore.getSlug();
        logStore.ingestLog('user workbench alert', 'error', 'workbench', actionAlert, projectSlug);
      }, 1000);
    }

    const alertTimestampsRef = useRef<number[]>([]); // Keep timestamps persistent
    const alertMinutesInterval = 1;
    const alertFixThresholdInInterval = 3;

    function formatError(jsonData: any) {
      const errorObj = typeof jsonData === 'string' ? JSON.parse(jsonData) : { ...jsonData };

      if (errorObj.content && typeof errorObj.content === 'string') {
        const lines = errorObj.content.split('\n');
        const truncatedLines = lines.slice(0, 5);
        errorObj.content = truncatedLines.join('\n');
      }

      return `\`\`\`sh\n${errorObj.content}\n\`\`\``;
    }

    function tryToFixError(actionAlert: any) {
      if (!actionAlert || !actionAlert.size) {
        return null;
      }

      const now = Date.now();
      const xMinutesAgo = now - alertMinutesInterval * 60 * 1000;

      // Remove timestamps older than `alertMinutesInterval`
      alertTimestampsRef.current = alertTimestampsRef.current.filter((timestamp) => timestamp >= xMinutesAgo);

      if (alertTimestampsRef.current.length < alertFixThresholdInInterval) {
        alertTimestampsRef.current.push(now); // Record the new attempt

        return setTimeout(() => {
          const errorMessage = `Fix error: ${formatError(actionAlert)}`;
          sendMessage({} as UIEvent, errorMessage, { hideUserImage: true });

          // Delay clearing alert to ensure `sendMessage` completes
          setTimeout(() => {
            workbenchStore.clearAlert();
          }, 100);
        }, 0);
      } else {
        // Rate limit exceeded: Skipping alert handling
        return null;
      }
    }

    return (
      <div className={'chat-page relative flex flex-col h-screen w-screen overflow-hidden'}>
        <FluidAnimation />
        <Header handleSendMessage={sendMessage} isStreaming={isLoading} handleStop={abort} />
        <BaseChat
          ref={animationScope}
          textareaRef={textareaRef}
          input={input}
          showChat={showChat}
          chatStarted={chatStarted}
          isStreaming={isLoading || fakeLoading}
          enhancingPrompt={enhancingPrompt}
          promptEnhanced={promptEnhanced}
          sendMessage={sendMessage}
          messageRef={messageRef}
          scrollRef={scrollRef}
          handleInputChange={(e) => {
            onTextareaChange(e);
            debouncedCachePrompt(e);
          }}
          handleStop={abort}
          description={description}
          importChat={importChat}
          exportChat={exportChat}
          messages={messages.map((message, i) => {
            if (message.role === 'user') {
              return message;
            }

            return {
              ...message,
              content: parsedMessages[i] || '',
            };
          })}
          enhancePrompt={() => {
            enhancePrompt(
              input,
              imageDataList,
              (input) => {
                setInput(input);
                scrollTextArea();
              },

              /*
               * model, // use specific LLM model (string)
               * provider, // use specific LLM provider (string)
               */
              apiKeys,
            );

            setUploadedFiles([]);
            setImageDataList([]);
          }}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          imageDataList={imageDataList}
          setImageDataList={setImageDataList}
          actionAlert={actionAlert}
          clearAlert={() => workbenchStore.clearAlert()}
        />
      </div>
    );
  },
);
