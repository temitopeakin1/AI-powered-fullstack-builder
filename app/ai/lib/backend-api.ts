import { getUserHeaderKey } from '~/ai/lib/stores/user/user';
import { UserStore } from '~/ai/lib/stores/user/userStore';

const BASE_URL = import.meta.env.CUSTOM_BACKEND_API;

export async function backendApiFetch(path: string, options: RequestInit = {}) {
  const userStore = UserStore.getInstance();
  const { getNewUserDataIfExpired, getToken } = userStore;

  const makeRequest = async (forceRefresh = false) => {
    await getNewUserDataIfExpired(forceRefresh);

    const headers = {
      ...options.headers,
      [getUserHeaderKey()]: getToken(),
    };

    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  };

  // First attempt.
  let response = await makeRequest();

  // If unauthorized, refresh token and retry.
  if (response.status === 403) {
    response = await makeRequest(true);
  }

  return response;
}
