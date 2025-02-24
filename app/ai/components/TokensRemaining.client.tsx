import React, { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { useNavigate } from '@remix-run/react';
import { TokensSession, TokensStore } from '~/ai/lib/stores/tokens/tokensStore';
import { workbenchStore } from '~/ai/lib/stores/workbench';

const TokenRemaining = ({ isStreaming }: { isStreaming: boolean }) => {
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [projectTokens, setProjectTokens] = useState<number | null>(null);
  const [freePromptsRemaining, setFreePromptsRemaining] = useState<number | null>(null);
  const navigate = useNavigate();

  const tokensStoreCallback = (data: TokensSession | null) => {
    if (data) {
      setRemainingTokens(data.remainingTokens);
      setProjectTokens(data.projectTokens);
      setFreePromptsRemaining(data.freeTokensRemaining);
    }
  };

  const tokensStore = TokensStore.getInstance(tokensStoreCallback);

  async function refreshTokens() {
    const data = await tokensStore.refreshTokensData();

    tokensStoreCallback(data);
  }

  useEffect(() => {
    const wasInit = remainingTokens !== null && projectTokens !== null && freePromptsRemaining !== null;

    if (!isStreaming || !wasInit) {
      refreshTokens();
    }
  }, [isStreaming, workbenchStore.getSlug()]);

  if (remainingTokens === null || projectTokens === null || freePromptsRemaining === null) {
    return null;
  }

  return (
    <ClientOnly>
      {() => (
        <div className="label-border">
          {freePromptsRemaining > 0 ? (
            <div style={{ color: '#FFD700' }}>
              {freePromptsRemaining} free prompt{freePromptsRemaining > 1 ? 's' : ''} remaining
            </div>
          ) : remainingTokens > 0 ? (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <img src="/icons/coin.svg" alt="Coins" />
                Tokens remaining
              </div>
              <span style={{ color: '#86F49C' }}>
                {new Intl.NumberFormat('de-DE').format(projectTokens)} /{' '}
                {new Intl.NumberFormat('de-DE').format(remainingTokens)}
              </span>
            </>
          ) : (
            <div
              style={{ color: '#FF6347', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/signup')}
            >
              Sign Up & Get More Tokens
            </div>
          )}
        </div>
      )}
    </ClientOnly>
  );
};

export default TokenRemaining;
