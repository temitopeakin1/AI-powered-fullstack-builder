import { clearCloudStore } from '~/ai/lib/stores/cloud/cloud-storage';
import { UserSession } from '~/types/user';

const BASE_URL = import.meta.env.CUSTOM_BACKEND_API;

// to be used for backend requests
export function getUserHeaderKey() {
  return 'user-token';
}

export async function signUp(formData: { username: string; email: string; password: string; referral?: string }) {
  return await fetch(`${BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      referral: formData.referral,
    }),
  });
}

export async function loginUser(formData: { username: string; password: string }) {
  const response = await fetch(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: formData.username,
      password: formData.password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as { message: string }).message || 'Login failed');
  }

  return data as UserSession;
}

export async function confirmUserEmail(token: string) {
  const response = await fetch(`${BASE_URL}/user/confirm-email?token=${token}`, {
    method: 'POST',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as { message: string }).message || 'Failed to confirm email.');
  }

  return data as UserSession;
}

export async function logoutUser(token: string) {
  try {
    await fetch(`${BASE_URL}/user/logout`, {
      method: 'GET',
      headers: {
        [getUserHeaderKey()]: token,
      },
    });

    // clear cache for other modules here
    clearCloudStore();
  } catch (err) {
    console.error('Failed to logout on the backend:', err);
  }
}

export async function forgetPassword(formData: { email: string }) {
  return await fetch(`${BASE_URL}/user/forgot-password?email=${formData.email}`, {
    method: 'POST',
  });
}

export async function confirmPassword({ token, password }: { token: string; password: string }) {
  try {
    const response = await fetch(`${BASE_URL}/user/confirm-forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorData = (await response.json()) as { message: string };
      throw new Error(errorData.message || 'Password update failed');
    }

    return response;
  } catch (error) {
    throw new Error((error as { message: string }).message || 'Something went wrong');
  }
}

export async function handleGitHubLogin(code: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/github/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const jsonRes = await response.json();

    if (!response.ok) {
      throw new Error((jsonRes as { message: string }).message || 'Failed to authenticate with Github');
    }

    return jsonRes as UserSession;
  } catch (error) {
    throw new Error((error as { message: string })?.message || 'Something went wrong');
  }
}

export function handleGitHubAuth() {
  const scope = 'repo:status repo_deployment user:email';
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.CUSTOM_GITHUB_CLIENT_ID}&redirect_uri=${import.meta.env.CUSTOM_GITHUB_REDIRECT_URI}&scope=${encodeURIComponent(scope)}`;
}

export async function doRefresh(refreshToken: string) {
  const res = await fetch(`${BASE_URL}/user/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }

  return (await res.json()) as UserSession;
}

export async function getUserByToken(token: string) {
  const res = await fetch(`${BASE_URL}/user/authenticate-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh token');
  }

  return (await res.json()) as UserSession;
}
