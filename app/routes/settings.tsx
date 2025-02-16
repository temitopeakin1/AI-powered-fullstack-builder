import { Outlet } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/common/Header/Header';
import { SettingsHeader } from '~/backOffice/components/settings/SettingsHeader';
import { SettingsNav } from '~/backOffice/components/settings/SettingsNav';
import CopyRighting from '~/components/common/copyRight';

export default function Settings() {
  return (
    <div className="w-full min-h-screen bg-black">
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
            <SettingsHeader />
          </div>

          <div className="mt-8">
            <SettingsNav />
            <div className="h-[1px] bg-[#2E2E2E] mt-[-1px]" />
          </div>
          <main className="mt-8">
            <Outlet />
          </main>
        </div>
      </div>

      <div className="mt-8">
        <CopyRighting />
      </div>
    </div>
  );
}
