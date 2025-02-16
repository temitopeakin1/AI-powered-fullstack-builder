import React, { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { db, deleteById, getAll, setMessages } from '~/ai/lib/persistence';
import { logStore } from '~/ai/lib/stores/logs';
import { classNames } from '~/utils/classNames';
import type { Message } from 'ai';

export default function HistoryActions() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const downloadAsJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAllChats = async () => {
    if (!db) {
      const error = new Error('Database is not available');
      logStore.logError('Failed to export chats - DB unavailable', error);
      toast.error('Database is not available');

      return;
    }

    try {
      const allChats = await getAll(db);
      const exportData = {
        chats: allChats,
        exportDate: new Date().toISOString(),
      };

      downloadAsJson(exportData, `all-chats-${new Date().toISOString()}.json`);
      logStore.logSystem('Chats exported successfully', { count: allChats.length });
      toast.success('Chats exported successfully');
    } catch (error) {
      logStore.logError('Failed to export chats', error);
      toast.error('Failed to export chats');
      console.error(error);
    }
  };

  const handleDeleteAllChats = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete all chats? This action cannot be undone.');

    if (!confirmDelete) {
      return;
    }

    if (!db) {
      const error = new Error('Database is not available');
      logStore.logError('Failed to delete chats - DB unavailable', error);
      toast.error('Database is not available');

      return;
    }

    try {
      setIsDeleting(true);

      const allChats = await getAll(db);
      await Promise.all(allChats.map((chat) => deleteById(db!, chat.id)));
      logStore.logSystem('All chats deleted successfully', { count: allChats.length });
      toast.success('All chats deleted successfully');
      navigate('/', { replace: true });
    } catch (error) {
      logStore.logError('Failed to delete chats', error);
      toast.error('Failed to delete chats');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportSettings = () => {
    const settings = {
      isDebugEnabled: Cookies.get('isDebugEnabled'),
      isEventLogsEnabled: Cookies.get('isEventLogsEnabled'),
      isLocalModelsEnabled: Cookies.get('isLocalModelsEnabled'),
      promptId: Cookies.get('promptId'),
      isLatestBranch: Cookies.get('isLatestBranch'),
      commitHash: Cookies.get('commitHash'),
      eventLogs: Cookies.get('eventLogs'),
      githubUsername: Cookies.get('githubUsername'),
      githubToken: Cookies.get('githubToken'),
      biela_theme: localStorage.getItem('biela_theme'),
    };

    downloadAsJson(settings, 'biela-settings.json');
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        Object.entries(settings).forEach(([key, value]) => {
          if (key === 'biela_theme') {
            if (value) {
              // localStorage.setItem(key, value as string);
              localStorage.setItem('biela_theme', 'dark');
            }
          } else if (value) {
            Cookies.set(key, value as string);
          }
        });

        toast.success('Settings imported successfully. Please refresh the page for changes to take effect.');
      } catch (error) {
        toast.error('Failed to import settings. Make sure the file is a valid JSON file.');
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const processChatData = (
    data: any,
  ): Array<{
    id: string;
    messages: Message[];
    description: string;
    urlId?: string;
  }> => {
    // Handle biela standard format (single chat)
    if (data.messages && Array.isArray(data.messages)) {
      const chatId = crypto.randomUUID();
      return [
        {
          id: chatId,
          messages: data.messages,
          description: data.description || 'Imported Chat',
          urlId: chatId,
        },
      ];
    }

    // Handle biela export format (multiple chats)
    if (data.chats && Array.isArray(data.chats)) {
      return data.chats.map((chat: { id?: string; messages: Message[]; description?: string; urlId?: string }) => ({
        id: chat.id || crypto.randomUUID(),
        messages: chat.messages,
        description: chat.description || 'Imported Chat',
        urlId: chat.urlId,
      }));
    }

    console.error('No matching format found for:', data);
    throw new Error('Unsupported chat format');
  };

  const handleImportChats = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file || !db) {
        toast.error('Something went wrong');
        return;
      }

      try {
        const content = await file.text();
        const data = JSON.parse(content);
        const chatsToImport = processChatData(data);

        for (const chat of chatsToImport) {
          await setMessages(db, chat.id, chat.messages, chat.urlId, chat.description);
        }

        logStore.logSystem('Chats imported successfully', { count: chatsToImport.length });
        toast.success(`Successfully imported ${chatsToImport.length} chat${chatsToImport.length > 1 ? 's' : ''}`);
        window.location.reload();
      } catch (error) {
        if (error instanceof Error) {
          logStore.logError('Failed to import chats:', error);
          toast.error('Failed to import chats: ' + error.message);
        } else {
          toast.error('Failed to import chats');
        }
        console.error(error);
      }
    };

    input.click();
  };

  return (
    <div className="p-4 bg-biela-elements-bg-depth-2 border border-biela-elements-borderColor rounded-lg mb-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-biela-elements-textPrimary mb-4">Data Management</h3>
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-biela-elements-textPrimary mb-2">Chat History</h4>
              <p className="text-sm text-biela-elements-textSecondary mb-4">Export or delete all your chat history.</p>
              <div className="flex gap-4">
                <button
                  onClick={handleExportAllChats}
                  className="px-4 py-2 bg-biela-elements-button-primary-background hover:bg-biela-elements-button-primary-backgroundHover text-biela-elements-textPrimary rounded-lg transition-colors"
                >
                  Export All Chats
                </button>
                <button
                  onClick={handleImportChats}
                  className="px-4 py-2 bg-biela-elements-button-primary-background hover:bg-biela-elements-button-primary-backgroundHover text-biela-elements-textPrimary rounded-lg transition-colors"
                >
                  Import Chats
                </button>
                <button
                  onClick={handleDeleteAllChats}
                  disabled={isDeleting}
                  className={classNames(
                    'px-4 py-2 bg-biela-elements-button-danger-background hover:bg-biela-elements-button-danger-backgroundHover text-biela-elements-button-danger-text rounded-lg transition-colors',
                    isDeleting ? 'opacity-50 cursor-not-allowed' : '',
                  )}
                >
                  {isDeleting ? 'Deleting...' : 'Delete All Chats'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-biela-elements-textPrimary mb-2">Settings Backup</h4>
              <p className="text-sm text-biela-elements-textSecondary mb-4">
                Export your settings to a JSON file or import settings from a previously exported file.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleExportSettings}
                  className="px-4 py-2 bg-biela-elements-button-primary-background hover:bg-biela-elements-button-primary-backgroundHover text-biela-elements-textPrimary rounded-lg transition-colors"
                >
                  Export Settings
                </button>
                <label className="px-4 py-2 bg-biela-elements-button-primary-background hover:bg-biela-elements-button-primary-backgroundHover text-biela-elements-textPrimary rounded-lg transition-colors cursor-pointer">
                  Import Settings
                  <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
