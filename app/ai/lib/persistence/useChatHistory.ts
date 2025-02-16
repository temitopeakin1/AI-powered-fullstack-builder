import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { logStore } from '~/ai/lib/stores/logs'; // Import logStore
import { createChatFromMessages, duplicateChat, getMessages, getUrlId, openDatabase, setMessages } from './db';
import JSZip from 'jszip';

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;
export const db = persistenceEnabled ? await openDatabase() : undefined;
export const chatId = atom<string | undefined>(generateUniqueChatId());
export const description = atom<string | undefined>(undefined);
export const chatTimestamp = atom<string | undefined>(undefined);

export function useChatHistory() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<{ id?: string }>();
  const { id: mixedId } = loaderData || {};
  const [searchParams] = useSearchParams();
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();

  useEffect(() => {
    if (!db) {
      setReady(true);

      if (persistenceEnabled) {
        const error = new Error('Chat persistence is unavailable');
        logStore.logError('Chat persistence initialization failed', error);
        toast.error('Chat persistence is unavailable');
      }

      return;
    }

    if (mixedId) {
      getMessages(db, mixedId)
        .then((storedMessages) => {
          if (storedMessages && storedMessages.messages.length > 0) {
            const rewindId = searchParams.get('rewindTo');
            const filteredMessages = rewindId
              ? storedMessages.messages.slice(0, storedMessages.messages.findIndex((m) => m.id === rewindId) + 1)
              : storedMessages.messages;

            setInitialMessages(filteredMessages);
            setUrlId(storedMessages.urlId);
            description.set(storedMessages.description);
            chatId.set(storedMessages.id);
            chatTimestamp.set(storedMessages.timestamp);
            if (rewindId) {
              // remove reviewTo param to prevent that on refresh it rolls back again to initial param
              // erasing post progress
              const newSearchParams = new URLSearchParams(searchParams.toString());
              newSearchParams.delete('rewindTo');

              navigate(
                {
                  pathname: window.location.pathname,
                  search: newSearchParams.toString()
                },
                { replace: true }
              );
            }
          } else {
            navigate('/', { replace: true });
          }

          setReady(true);
        })
        .catch((error) => {
          logStore.logError('Failed to load chat messages', error);
          toast.error(error.message);
        });
    }
  }, []);

  return {
    ready: !mixedId || ready,
    initialMessages,
    storeMessageHistory: async (messages: Message[]) => {
      if (!db || messages.length === 0) {
        return;
      }

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        const urlId = await getUrlId(db, firstArtifact.id);

        navigateChat(urlId);
        setUrlId(urlId);
      }

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      if (initialMessages.length === 0 && !chatId.get()) {
        const nextId = generateUniqueChatId();

        chatId.set(nextId);
        chatTimestamp.set(new Date().toISOString());

        if (!urlId) {
          navigateChat(nextId);
        }
      }

      await setMessages(db, chatId.get() as string, messages, urlId, description.get());
    },
    duplicateCurrentChat: async (listItemId: string) => {
      if (!db || (!mixedId && !listItemId)) {
        return;
      }

      try {
        const newId = await duplicateChat(db, mixedId || listItemId);
        navigate(`/chat/${newId}`);
        toast.success('Chat duplicated successfully');
      } catch (error) {
        toast.error('Failed to duplicate chat');
        console.error(error);
      }
    },
    importChat: async (description: string, messages: Message[]) => {
      if (!db) {
        return;
      }

      try {
        const newId = await createChatFromMessages(db, description, messages);
        window.location.href = `/chat/${newId}`;
        toast.success('Project imported successfully');
      } catch (error) {
        if (error instanceof Error) {
          toast.error('Failed to import chat: ' + error.message);
        } else {
          toast.error('Failed to import chat');
        }
      }
    },
    exportChat: async (id = urlId) => {
      if (!db || !id) {
        return;
      }

      const chat = await getMessages(db, id);
      const chatData = {
        messages: chat.messages,
        description: chat.description,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    downloadProject: async (id?: string) => {
      if (!db) {
        console.error('Database is not initialized');
        toast.error('Database is not available');

        return;
      }

      try {
        if (!id) {
          toast.error('No chat ID provided');
          return;
        }

        // Get the chat data for the specified ID
        const chat = await getMessages(db, id);

        if (!chat) {
          toast.error('Chat not found');
          return;
        }

        const zip = new JSZip();
        let filesFound = false;

        // Extract files from chat messages
        for (const msg of chat.messages) {
          if (msg.role === 'assistant' && typeof msg.content === 'string') {
            // Try both bielaAction and bielaArtifact tags with filePath
            const actionRegex = /<bielaAction[^>]*type="file"[^>]*filePath="([^"]+)"[^>]*>([\s\S]*?)<\/bielaAction>/g;
            const artifactRegex =
              /<bielaArtifact[^>]*type="file"[^>]*filePath="([^"]+)"[^>]*>([\s\S]*?)<\/bielaArtifact>/g;

            let match;

            // Try bielaAction tags
            while ((match = actionRegex.exec(msg.content)) !== null) {
              const [full, filePath, content] = match;

              if (filePath && content) {
                filesFound = true;
                zip.file(filePath, content.trim(), {
                  createFolders: true,
                });
              }
            }

            // Try bielaArtifact tags
            while ((match = artifactRegex.exec(msg.content)) !== null) {
              const [full, filePath, content] = match;

              if (filePath && content) {
                filesFound = true;
                zip.file(filePath, content.trim(), {
                  createFolders: true,
                });
              }
            }
          }
        }

        if (!filesFound) {
          console.error('No files found in chat messages');
          toast.error('No files found in this chat');

          return;
        }

        const blob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const filename = `${chat.description || 'biela-project'}.zip`.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Project downloaded successfully');
      } catch (error) {
        console.error('Error in downloadProject:', error);

        if (error instanceof Error) {
          toast.error(`Download failed: ${error.message}`);
        } else {
          toast.error('Failed to download project');
        }
      }
    },
  };
}

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}

export function generateUniqueChatId() {
  return Date.now().toString();
}
