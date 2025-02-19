import { backendApiFetch } from '~/ai/lib/backend-api';
import { workbenchStore } from '~/ai/lib/stores/workbench';

export interface Project {
  created_at: string;
  projectSlug: string;
  updated_at: Date;
  userId: string;
  _id: string;
}

export async function uploadProject() {
  try {
    const { content, projectSlug } = await workbenchStore.getFilesZip();

    const formData = new FormData();
    formData.append('file', content, `${projectSlug}.zip`);

    const url = `/projects/${projectSlug}/code`;

    const response = await backendApiFetch(url, {
      method: 'POST',
      body: formData,
    });

    return (await response.json()) as Project;
  } catch (error) {
    console.error('Error saving project:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function downloadProjectZipBuffer() {
  try {
    const projectSlug = workbenchStore.getSlug();

    const url = `/projects/${projectSlug}/code`;

    const response = await backendApiFetch(url, {
      method: 'GET',
    });

    const json = (await response.json()) as { data: ArrayBuffer };

    return json?.data;
  } catch (error) {
    console.error('Error deploying project:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
