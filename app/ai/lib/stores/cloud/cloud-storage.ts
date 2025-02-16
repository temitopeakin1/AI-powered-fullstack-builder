export function clearCloudStore() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('app-')) {
      localStorage.removeItem(key);
    }
  });
}

export function setAppData(projectSlug, data) {
  const key = `app-${projectSlug}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCachedAppState(projectSlug) {
  const key = `app-${projectSlug}`;

  const json = localStorage.getItem(key);

  return json ? JSON.parse(json) : undefined;
}