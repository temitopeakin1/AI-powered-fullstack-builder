import React, {useEffect, useState} from 'react';
import { useNavigate } from '@remix-run/react';
import {Check} from "lucide-react";
import {backendApiFetch} from "~/ai/lib/backend-api";
import {workbenchStore} from "~/ai/lib/stores/workbench";
import LoadingAnimation from '~/ai/components/LoadingAnimation';


export const OAuthCallbackClient = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.CUSTOM_BACKEND_API;
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuthCode = async () => {

    setIsLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const codeVerifier = localStorage.getItem('code_verifier');
      const chatId = localStorage.getItem('chatID');
      const projectSlug =localStorage.getItem('projectSlug');

      if (code) {

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
          localStorage.setItem('justConnectedSupabase', 'true')

          setTimeout(() => {
            window.location.href = `chat/${chatId}`;
          }, 1000);
        }

        if(data.message.includes('PROJECT_LIMIT_REACHED')) {
          setIsLoading(false);
          setShow(true);
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
        show && (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Limit Reached Please Delete Projects or increase your limit in supabase
            </h2>
            <div className="space-y-4 text-2xl font-bold mb-6 text-white">
              Go to https://supabase.com/dashboard/projects , click on the project, Project Settings, bottom Delete.
              Then try again to Connect.
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        )
      )}
    </>
  );
};

