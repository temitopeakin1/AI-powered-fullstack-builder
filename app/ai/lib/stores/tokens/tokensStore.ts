// tokensStore.ts
import { backendApiFetch } from '~/ai/lib/backend-api';
import { workbenchStore } from '~/ai/lib/stores/workbench';

// Define the shape of the tokens data we wish to store
export interface TokensSession {
  remainingTokens: number;
  projectTokens: number;
  freeTokensRemaining: number;
}

export class TokensStore {
  private static _instance: TokensStore;
  private _tokensData: TokensSession | null = null;
  private readonly _setTokensCallback: (data: TokensSession | null) => void;

  constructor(setTokensCallback: (data: TokensSession | null) => void) {
    this._setTokensCallback = setTokensCallback;
  }

  private _setTokensData(data: TokensSession | null) {
    this._tokensData = data;
    this._setTokensCallback(data);
  }

  getRemainingTokens(): number | null {
    return this._tokensData?.remainingTokens ?? null;
  }

  getProjectTokens(): number | null {
    return this._tokensData?.projectTokens ?? null;
  }

  async refreshTokensData(): Promise<TokensSession | void> {
    try {
      const projectSlug = workbenchStore.getSlug();

      const url = `/tokens/project/${projectSlug}`;

      const response = await backendApiFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json()) as {
        userBalance: number;
        projectTokensConsumed: number;
        freePromptsRemaining: number;
      };

      const tokensSession: TokensSession = {
        remainingTokens: data.userBalance,
        projectTokens: data.projectTokensConsumed,
        freeTokensRemaining: data.freePromptsRemaining,
      };

      this._setTokensData(tokensSession);

      return tokensSession;
    } catch (error) {
      console.error('Error refreshing tokens data:', error);

      return void 0;
    }
  }

  static getInstance(setTokensCallback?: (data: TokensSession | null) => void): TokensStore {
    if (!TokensStore._instance && setTokensCallback) {
      TokensStore._instance = new TokensStore(setTokensCallback);
    }

    return TokensStore._instance;
  }
}

export const createTokensStore = (setTokensCallback: (data: TokensSession | null) => void): TokensStore =>
  new TokensStore(setTokensCallback);
