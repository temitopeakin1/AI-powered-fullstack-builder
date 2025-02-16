import { getUserHeaderKey } from '~/ai/lib/stores/user/user';
import { UserStore } from '~/ai/lib/stores/user/userStore';

const BASE_URL = import.meta.env.CUSTOM_BACKEND_API;

export async function backendApiFetch(path: string, options: RequestInit = {}) {
  const userStore = UserStore.getInstance();
  const { getNewUserDataIfExpired, getToken } = userStore;

  // check if token is expired (and refresh if needed).
  await getNewUserDataIfExpired();

  const headers = {
    ...options.headers,
    [getUserHeaderKey()]: getToken(),
  };

  return await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
