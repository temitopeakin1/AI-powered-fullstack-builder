import { backendApiFetch } from '~/ai/lib/backend-api';
import { workbenchStore } from '../workbench';
import { getCachedAppState, setAppData } from './cloud-storage';

export async function getAppState(cached?: boolean) {
  if (cached) {
    const projectSlug = workbenchStore.getSlug();
    const cachedData = getCachedAppState(projectSlug);

    if (cachedData) {
      return cachedData;
    }
  }

  const projectSlug = workbenchStore.getSlug();

  const url = `/cloud/app/${projectSlug}`;

  if (projectSlug.includes('undefined')) {
    return;
  }

  try {
    const response = await backendApiFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wallet-token': localStorage.getItem('wallet-token') || '',
      },
    });

    const data = await response.json();

    // console.log('app status:', data);

    setAppData(data);

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('No logged-in user found')) {
      return;
    }

    console.error('Error backendApiFetching app state:/', error);
  }
}

export async function deploy() {
  try {
    const { content, projectSlug } = await workbenchStore.getFilesZip();

    const formData = new FormData();
    formData.append('file', content, `${projectSlug}.zip`);

    const url = `/cloud/app/${projectSlug}/deploy`;

    const response = await backendApiFetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setAppData(projectSlug, data);
  } catch (error) {
    console.error('Error deploying project:', error instanceof Error ? error.message : String(error));
    alert('Failed to deploy project. Please try again later.');
  }
}
