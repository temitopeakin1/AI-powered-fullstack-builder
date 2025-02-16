import { workbenchStore } from './workbench';
import { backendApiFetch } from '../backend-api';

export async function refreshTokensData() {
  try {
    const projectSlug = workbenchStore.getSlug();

    const url = `/tokens/project/${projectSlug}`;

    const response = await backendApiFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error backendApiFetching app state:', error);
  }
}
