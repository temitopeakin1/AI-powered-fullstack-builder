import React, {useEffect, useState} from 'react';
import { chatId, db } from '~/ai/lib/persistence/useChatHistory';
import {backendApiFetch} from "~/ai/lib/backend-api";
import {UserStore} from "~/ai/lib/stores/user/userStore";
import {workbenchStore} from "~/ai/lib/stores/workbench";

const SupabaseConnectClient = () => {


  const OAUTH_CLIENT_ID = import.meta.env.SUPA_OAUTH_CLIENT_ID;
  const SUPABASE_CALLBACK = import.meta.env.SUPA_CALLBACK;
  const [projectSlug, setProjectSlug] = useState<string | null>(null);


  useEffect(() => {
    const initializeProjectSlug = async () => {

      await new Promise(resolve => setTimeout(resolve, 500));
      const slug = workbenchStore.getSlug();
      setProjectSlug(slug);
      localStorage.setItem('projectSlug',slug)
    };

    initializeProjectSlug();
  }, []);


  const [isConnected, setIsConnected] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);


  const handleConnect = async () => {

    const response = await backendApiFetch('/supabase/auth-url', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok && data.authUrl) {
      localStorage.setItem('code_verifier', data.codeVerifier);
      localStorage.setItem('chatID', chatId.get() as string);
      window.location.href = data.authUrl;
    }

  };


  useEffect(() => {
    const checkSupabaseConnection = async () => {

      const userStore = UserStore.getInstance();
      const user = userStore.getUser();

      if (!projectSlug) return;

      if (!user) return;

      setHasStoredUser(true);



      try {
        const response = await backendApiFetch(`/supabase/project/${projectSlug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.projectId) {
          setIsConnected(true);
          localStorage.setItem('projectUrl',data.projectUrl);
          localStorage.setItem('annonKey',data.annonKey);
        } else {
          localStorage.removeItem('projectUrl');
          localStorage.removeItem('annonKey');
          setIsConnected(false);
        }
      } catch (error) {
        localStorage.removeItem('projectUrl');
        localStorage.removeItem('annonKey');
        setIsConnected(false);
      }
    };

    checkSupabaseConnection();
  }, [projectSlug]);

  if (!hasStoredUser) {
    return null;
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnected}
      className="download-btn flex items-center gap-2"
    >
      <img src="/icons/supabase-logo-icon.svg"  alt="Supabase" />
      {isConnected ? 'Supabase Connected' : 'Supabase Connect'}
    </button>
  );
};

export default SupabaseConnectClient;
