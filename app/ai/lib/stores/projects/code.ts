import { backendApiFetch } from '~/ai/lib/backend-api';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { Message } from 'ai';

export interface Project {
  created_at: string;
  projectSlug: string;
  updated_at: Date;
  userId: string;
  _id: string;
}

export interface ProjectCommits {
  date: Date;
  message: string;
  sha: string;
  messages?: Message[];
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

    return (await response.json()) as ProjectCommits[];
  } catch (error) {
    console.error('Error saving project:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function downloadProjectZipBuffer(commitHash: string) {
  try {
    const projectSlug = workbenchStore.getSlug();

    const url = `/projects/${projectSlug}/code/${commitHash}`;

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

export function setProjectCommits(projectSlug: string, commits: ProjectCommits[]) {
  const key = `commits-${projectSlug}`;

  localStorage.setItem(key, JSON.stringify(commits));
}

export async function getProjectCommits(projectSlug: string) {
  const key = `commits-${projectSlug}`;

  const locale = localStorage.getItem(key);

  if (locale) {
    return JSON.parse(locale) as ProjectCommits[];
  }

  const commits = await listProjectCommits(projectSlug);

  setProjectCommits(projectSlug, commits as ProjectCommits[]);

  return commits;
}

export async function listProjectCommits(projectSlug?: string) {
  try {
    const slug = projectSlug ?? workbenchStore.getSlug();

    const url = `/projects/${slug}/commits`;

    const response = await backendApiFetch(url, {
      method: 'GET',
    });

    const json = await response.json();

    return json as ProjectCommits[];
  } catch (error) {
    console.error('Error listing project commits:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
