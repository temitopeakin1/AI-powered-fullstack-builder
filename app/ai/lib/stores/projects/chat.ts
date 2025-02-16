import { backendApiFetch } from '~/ai/lib/backend-api';
import { workbenchStore } from '../workbench';
import { Message } from 'ai';
import { UserStore } from '~/ai/lib/stores/user/userStore';

export async function uploadChatMessages(messages: Message[]) {
  try {
    const userStore = UserStore.getInstance();
    const { isLoggedIn } = userStore;

    if (!isLoggedIn()) {
      return null;
    }

    const projectSlug = workbenchStore.getSlug();

    const path = `/projects/${projectSlug}/chat/messages`;

    const response = await backendApiFetch(path, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: { 'Content-Type': 'application/json' },
    });

    return await response.json();
  } catch (error) {
    console.error('Error saving chat messages:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function downloadChatMessages() {
  try {
    const projectSlug = workbenchStore.getSlug();

    const url = `/projects/${projectSlug}/chat/messages`;

    const response = await backendApiFetch(url, {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Error downloading chat messages:', error instanceof Error ? error.message : String(error));
  }
}
