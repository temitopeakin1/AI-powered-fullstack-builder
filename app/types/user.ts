export interface UserSession {
  id: string;
  username: string;
  email: string;
  token?: string; // short-lived token
  refreshToken: string; // long-lived token, used to get new token,
  provider: number;

  // expiration data
  tokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export type UserContextType = {
  user: UserSession | null;
  getUser: () => UserSession | null;
  getToken: () => string | null;
  setUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
  login: (data: UserLoginContextType) => Promise<void>;
  githubLogin: (code: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  isLoggedIn: () => boolean;
  authenticateToken: () => Promise<void>;
  getNewUserDataIfExpired: () => Promise<void>;
};

export type UserLoginContextType = {
  username: string;
  password: string;
};

export type UserSignupContextType = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  referral?: string;
};

export const expirationSettings = {
  tokenExpirationMinutes: 14,
  refreshTokenExpirationDays: 7,
};
