import React, { useEffect, useState } from 'react';
import { chatId } from '~/ai/lib/persistence/useChatHistory';
import { backendApiFetch } from "~/ai/lib/backend-api";
import { UserStore } from "~/ai/lib/stores/user/userStore";
import { workbenchStore } from "~/ai/lib/stores/workbench";

const SupabaseConnectClient = () => {
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const initializeProjectSlug = async () => {
      const slug = workbenchStore.getSlug();
      setProjectSlug(slug);
      localStorage.setItem('projectSlug', slug);
    };

    initializeProjectSlug();
  }, []);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      const userStore = UserStore.getInstance();
      const user = userStore.getUser();

      if (!projectSlug || !user) return;

      try {
        const response = await backendApiFetch(`/supabase/project/${projectSlug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });

        const data = await response.json();

        if (response.ok && data.projectId) {
          setIsConnected(true);
          localStorage.setItem('projectUrl', data.projectUrl);
          localStorage.setItem('annonKey', data.annonKey);
          setProjectId(data.projectId);
        } else {
          clearSupabaseData();
        }
      } catch (error) {
        clearSupabaseData();
      }
    };

    checkSupabaseConnection();
  }, [projectSlug]);

  const clearSupabaseData = () => {
    localStorage.removeItem('projectUrl');
    localStorage.removeItem('annonKey');
    setIsConnected(false);
    setProjectId(null);
  };

  const handleSupabaseAuthComplete = (data: { projectUrl: string; annonKey: string }) => {
    setIsConnected(true);
    localStorage.setItem('projectUrl', data.projectUrl);
    localStorage.setItem('annonKey', data.annonKey);
    localStorage.setItem('justConnectedSupabase', 'true');
    setProjectId(data.projectUrl.split('//')[1].split('.')[0]);

    workbenchStore.actionAlert.set({
      type: 'database',
      title: 'Database Creation',
      description: 'Would you like to create a database for your project?',
      content: 'Content',
      source: 'preview',
    });

  };

  const handleConnect = async () => {
    if (isConnected && projectId) {
      window.open(`https://supabase.com/dashboard/project/${projectId}/editor`, '_blank');
      return;
    }

    const response = await backendApiFetch('/supabase/auth-url', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok && data.authUrl) {
      localStorage.setItem('code_verifier', data.codeVerifier);
      localStorage.setItem('chatID', chatId.get() as string);
      window.open(data.authUrl, '_blank');

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'supabaseAuthData' && e.newValue) {
          try {
            const authData = JSON.parse(e.newValue);
            localStorage.removeItem('supabaseAuthData');
            handleSupabaseAuthComplete(authData);
          } catch (err) {
            console.error('Error processing auth data:', err);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('message', (event) => {
        if (event.data.type === 'SUPABASE_AUTH_COMPLETE') {
          handleSupabaseAuthComplete(event.data);
        }
      }, { once: true });
    }
  };

  const user = UserStore.getInstance().getUser();
  if (!user) return null;

  return (
    <button
      onClick={handleConnect}
      className="download-btn flex items-center gap-2">
      <img src="/icons/supabase-logo-icon.svg" alt="Supabase" />
      {isConnected ? 'Supabase Dashboard' : 'Supabase Connect'}
    </button>
  );
};

export default SupabaseConnectClient;
