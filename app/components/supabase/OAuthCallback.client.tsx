import React, {useEffect, useState} from 'react';
import { useNavigate } from '@remix-run/react';
import {Check} from "lucide-react";
import {backendApiFetch} from "~/ai/lib/backend-api";
import LoadingAnimation from '~/ai/components/LoadingAnimation';
import ErrorSupabaseDialog from '~/ai/components/ErrorSupabaseDialog';


export const OAuthCallbackClient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isErrorSupabaseDialogOpen, setErrorSupabaseDialogOpen] = useState(false);

  const handleAuthCode = async () => {

    setIsLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const codeVerifier = localStorage.getItem('code_verifier');
      const chatId = localStorage.getItem('chatID');
      const projectSlug =localStorage.getItem('projectSlug');

      if (code) {

        const handleAuthSuccess = (data: unknown) => {
          const authData = {
            type: 'SUPABASE_AUTH_COMPLETE',
            projectUrl: data.projectUrl,
            annonKey: data.annonKey
          };

          localStorage.setItem('supabaseAuthData', JSON.stringify(authData));

          if (window.opener) {
            window.opener.postMessage(authData, window.location.origin);
          }

          setTimeout(() => window.close(), 1000);
        };

        const response = await backendApiFetch(`/supabase/supabase-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            codeVerifier,
            projectSlug,
          })
        });

        const data = await response.json();

        if (data.success) {
          setIsSuccess(true);
          handleAuthSuccess(data);

        }

        if(data.message.includes('PROJECT_LIMIT_REACHED')) {
          setIsLoading(false);
          setErrorSupabaseDialogOpen(true);
        }
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    const response = await handleAuthCode();
    if (response.success) {
      const chatId = localStorage.getItem('chatID');
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = `chat/${chatId}`;
      }, 1000);
    }
  };

  useEffect(() => {
    handleAuthCode();
  }, [navigate]);


  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingAnimation />
        </div>
      ) : isSuccess ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500">
              <Check className="w-8 h-8 text-white" />
            </div>
            <span className="mt-4 text-white">Successfully connected!</span>
          </div>
        </div>
      ) : (
        <ErrorSupabaseDialog
          isOpen={isErrorSupabaseDialogOpen}
          onEdit={handleRetry}
          onClose={() => setErrorSupabaseDialogOpen(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

