import { expirationSettings, UserSession } from '~/types/user';
import {
  confirmUserEmail,
  doRefresh,
  getUserByToken,
  handleGitHubLogin,
  handleGoogleLogin,
  loginUser,
  logoutUser,
} from './user';
import { add, isAfter, isBefore } from 'date-fns';

/**
 * Singleton class for managing user session state.
 */
export class UserStore {
  /**
   * Singleton UserStore instance
   */
  private static _instance: UserStore;

  /**
   * Existing user session.
   */
  private _user: UserSession | null = null;

  /**
   * Google state
   */
  private _googleState: string | null = null;

  /**
   * Promise to track ongoing token refresh operations.
   * This prevents multiple concurrent refresh attempts within the same tab.
   */
  private _refreshPromise: Promise<void> | null = null;

  /**
   * Key used in localStorage to implement a cross-tab locking mechanism.
   * This prevents concurrent token refresh attempts across multiple browser tabs.
   */
  private _refreshLockKey = 'token_refresh_lock';

  /**
   * Maximum time that a refresh lock can be held.
   * If a tab holds the lock longer than this timeout, other tabs will assume the lock is stale
   * and attempt to acquire it. This prevents deadlocks if a tab crashes while holding the lock.
   */
  private _refreshLockTimeout = 10000;
  private readonly _setUserCallback: (user: UserSession | null) => void;

  /**
   * Creates an instance of UserStore.
   * @param {function(UserSession | null): void} setUserCallback - Callback to update React state.
   */
  constructor(setUserCallback: (user: UserSession | null) => void) {
    this._setUserCallback = setUserCallback;
  }

  /**
   * Sets the current user session and updates localStorage.
   * @param {UserSession | null} user - The user session to set.
   */
  setUser = (user: UserSession | null) => {
    this._user = user;

    if (user?.token) {
      localStorage.setItem('token', user.token);
    }

    if (user?.refreshToken) {
      localStorage.setItem('refreshToken', user.refreshToken);
    }

    localStorage.setItem('user', JSON.stringify(user));

    this._setUserCallback(user); // This updates React's state via the callback
  };

  /**
   * Retrieves the current user session.
   * @returns {UserSession | null} The current user session.
   */
  getUser = (): UserSession | null => {
    if (this._user) {
      return this._user;
    }

    let localUser: UserSession | null = null;

    try {
      localUser = JSON.parse(localStorage.getItem('user') as string);
      // eslint-disable-next-line
    } catch (_) {
      // ignore
    }

    return localUser;
  };

  /**
   * Set the current google state and update localStorage
   * @param {string | null} state - The state to set.
   */
  setGoogleState = (state: string | null) => {
    this._googleState = state;

    localStorage.setItem('googleState', state ? state : '');
  };

  /**
   * Retrieves the current google state
   */
  getGoogleState = (): string | null => {
    if (this._googleState) {
      return this._googleState;
    }

    let localGoogleState: string | null = null;

    try {
      localGoogleState = localStorage.getItem('googleState') as string;
    } catch (_) {
      // ignore
    }

    return localGoogleState;
  };

  /**
   * Sets expiration timestamps for the user's token and refresh token.
   * @param {UserSession} user - The user session to update.
   */
  setUserExpiration = (user: UserSession) => {
    const tokenExpiresAt = new Date(),
      refreshTokenExpiresAt = new Date();

    user.tokenExpiresAt = add(tokenExpiresAt, {
      minutes: expirationSettings.tokenExpirationMinutes,
    });
    user.refreshTokenExpiresAt = add(refreshTokenExpiresAt, {
      days: expirationSettings.refreshTokenExpirationDays,
    });

    this.setUser(user);
  };

  /**
   * Retrieves the authentication token.
   * @returns {string | null} The token, if available.
   */
  getToken = (): string | null => this.getUser()?.token ?? localStorage.getItem('token');

  /**
   * Retrieves the refresh token.
   * @returns {string | null} The refresh token, if available.
   */
  getRefreshToken = (): string | null => this.getUser()?.refreshToken ?? localStorage.getItem('refreshToken');

  /**
   * Checks if a user is logged in.
   * @returns {boolean} True if a user session exists, false otherwise.
   */
  isLoggedIn = (): boolean => !!this.getUser();

  /**
   * Logs in a user with provided credentials.
   * @param {{ username: string; password: string }} formData - The login credentials.
   * @throws {Error} If username or password is missing.
   */
  login = async (formData: { username: string; password: string }) => {
    if (!formData?.username || !formData?.password) {
      throw new Error('Missing username or password');
    }

    if (this.isLoggedIn()) {
      return;
    }

    const loggedUser = await loginUser(formData);

    this.setUserExpiration(loggedUser as UserSession);
  };

  /**
   * Handles GitHub OAuth login.
   * @param {string} code - The GitHub authorization code.
   * @throws {Error} If the code is missing.
   */
  githubLogin = async (code: string) => {
    if (!code) {
      throw new Error('Missing GitHub code for login.');
    }

    if (this.isLoggedIn()) {
      return;
    }

    const loggedUser = await handleGitHubLogin(code);

    this.setUserExpiration(loggedUser as UserSession);
  };

  /**
   * Handles Google OAuth login.
   * @param {string} code - The Google authorization code.
   * @param {string} state - The random generated state
   * @throws {Error} If the code is missing.
   */
  googleLogin = async (code: string, state: string) => {
    if (!code) {
      throw new Error('Missing Google code for login.');
    }

    if (!state) {
      throw new Error('Missing Google state for login.');
    }

    const localGoogleState = this.getGoogleState();
    if (localGoogleState != state) {
      throw new Error('Provided state is invalid');
    }

    if (this.isLoggedIn()) {
      return;
    }

    // User Store si local storage stocam state ul si dupa il verif si sterg

    const loggedUser = await handleGoogleLogin(code);

    this.setUserExpiration(loggedUser as UserSession);
  };

  /**
   * Logs out the current user and clears session data.
   */
  logout = async () => {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token) {
      return;
    }

    await logoutUser(token as string, refreshToken as string);

    this.setUser(null);
  };

  /**
   * Confirms user email using a token.
   * @param {string} token - The email confirmation token.
   * @throws {Error} If the token is missing.
   */
  confirmEmail = async (token: string) => {
    if (!token) {
      throw new Error('Missing required data to validate email.');
    }

    const loggedUser = await confirmUserEmail(token);

    this.setUserExpiration(loggedUser);
  };

  /**
   * Retrieves the current user refresh token promise.
   * @returns {Promise<void> | null} The current user session.
   */
  getRefreshPromise = (): Promise<void> | null => this._refreshPromise;

  /**
   * Sets the current user refresh token promise with a new one.
   * @param {Promise<void>} promise - The promise to be set.
   */
  setRefreshPromise = (promise: Promise<void>) => {
    this._refreshPromise = promise;
  };

  /**
   * Checks if the user's token has expired and refreshes it if necessary.
   *
   * Problem: When a user has multiple tabs open and a token expires, each tab might
   * try to refresh the token simultaneously. This leads to multiple unnecessary API calls
   * and potential race conditions where different tabs end up with different tokens.
   *
   * Solution: Implements a two-level locking mechanism:
   * 1. Tab-level lock using the refreshPromise to prevent concurrent refreshes in the same tab
   * 2. Cross-tab lock using localStorage to coordinate refresh attempts across different tabs
   *
   * @returns Updated user session with refreshed tokens if needed, or the same session if tokens are still valid
   * @throws Error if both tokens are expired or refresh fails
   */
  getNewUserDataIfExpired = async (forceRefresh = false) => {
    const user = this.getUser();

    if (!user) {
      return;
    }

    const { tokenExpiresAt, refreshTokenExpiresAt } = user;

    if (!forceRefresh && isAfter(tokenExpiresAt, new Date())) {
      return;
    }

    /*
     * if the short-lived token is expired, try to refresh it or force logout
     * If refresh token also expired, we must force logout.
     */
    if (isBefore(refreshTokenExpiresAt, new Date())) {
      await this.logout();

      throw new Error('Session expired. Please log in again.');
    }

    const lockValue = localStorage.getItem(this._refreshLockKey);
    const lockTimestamp = lockValue ? parseInt(lockValue, 10) : 0;
    const now = Date.now();

    if (lockTimestamp && now - lockTimestamp < this._refreshLockTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedUser = this.getUser();

      if (updatedUser && updatedUser.tokenExpiresAt !== user.tokenExpiresAt) {
        return;
      }
    }

    localStorage.setItem(this._refreshLockKey, now.toString());

    try {
      if (!this._refreshPromise) {
        this.setRefreshPromise(
          this.refreshToken()
            .then((refreshedUser) => {
              this.setUserExpiration(refreshedUser as UserSession);
            })
            .finally(() => {
              localStorage.removeItem(this._refreshLockKey);
            }),
        );
      }

      await this.getRefreshPromise();
    } catch (err) {
      console.error('Token refresh failed:', err);

      await this.logout();

      throw new Error('Token refresh failed. Please log in again.');
    }
  };

  /**
   * Refreshes the user's authentication token.
   * @returns {Promise<UserSession | null>} The refreshed user session.
   */
  refreshToken = async (): Promise<UserSession | null> => {
    const token = this.getRefreshToken();

    if (!token) {
      return null;
    }

    return await doRefresh(token);
  };

  /**
   * Authenticates the stored token and retrieves the user session.
   * @returns {Promise<void>}
   */
  authenticateToken = async (): Promise<void> => {
    const token = this.getToken();

    if (!token) {
      return;
    }

    const user = await getUserByToken(token);

    this.setUserExpiration(user);
  };

  /**
   * Returns the singleton instance of UserStore.
   * @param {function(UserSession | null): void} [setUserCallback] - Optional callback to update React state.
   * @returns {UserStore} The UserStore instance.
   */
  static getInstance(setUserCallback?: (user: UserSession | null) => void): UserStore {
    if (!UserStore._instance && setUserCallback) {
      UserStore._instance = new UserStore(setUserCallback);
    }

    return UserStore._instance;
  }
}

/**
 * Creates a new instance of UserStore.
 * @param {function(UserSession | null): void} setUserCallback - Callback to update React state.
 * @returns {UserStore} A new UserStore instance.
 */
export const createUserStore = (setUserCallback: (user: UserSession | null) => void): UserStore =>
  new UserStore(setUserCallback);
