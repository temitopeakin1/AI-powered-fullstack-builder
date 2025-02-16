import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/common/Header/Header';
import CopyRighting from '~/components/common/copyRight';
import { TermsHeader } from '~/backOffice/components/termsOfUse/TermsHeader';
import TermsOfUseInfo from '~/routes/terms-of-use.info';

export default function termsOfUse() {
  return (
    <div className="w-full bg-black">
      <ClientOnly>
        {() => (
          <Header
            handleSendMessage={(e, messageInput) => console.log('Message sent:', messageInput)}
            isStreaming={false}
            handleStop={() => console.log('Stream stopped')}
            isSettingsPage={true}
          />
        )}
      </ClientOnly>
      <div className="xl:flex items-center justify-center">
        <div className="p-5 md:p-10 xl:w-[1169px] 2xl:w-[1489px]">
          <div>
            <TermsHeader />
          </div>

          <div className="mt-8">
            <div className="h-[1px] bg-[#2E2E2E] mt-16" />
          </div>
          <main className="mt-16">
            <TermsOfUseInfo />
          </main>
        </div>
      </div>

      <div className="fixed bottom-0 w-full">
        <CopyRighting />
      </div>
    </div>
  );
}
