import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/ai/components/BaseChat';
import { Chat } from '~/ai/components/Chat.client';

export const meta: MetaFunction = () => {
  return [{ title: 'biela.dev' }, { name: 'description', content: 'Talk with biela.dev, an AI assistant from TMC' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-biela-elements-background-depth-1">
      <ClientOnly fallback={<BaseChat />}>
        {() => (
          <>
            <Chat />
          </>
        )}
      </ClientOnly>
    </div>
  );
}
