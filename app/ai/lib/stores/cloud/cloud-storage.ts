export function clearCloudStore() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('app-')) {
      localStorage.removeItem(key);
    }
  });
}

export function setAppData(projectSlug: string, data) {
  const key = `app-${projectSlug}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCachedAppState(projectSlug: string) {
  const key = `app-${projectSlug}`;

  const json = localStorage.getItem(key);

  return json ? JSON.parse(json) : undefined;
}
