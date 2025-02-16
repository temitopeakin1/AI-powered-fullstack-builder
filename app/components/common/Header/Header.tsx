import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/ai/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { ChatDescription } from '~/ai/lib/persistence/ChatDescription.client';
import React, { useEffect, useRef, useState } from 'react';
import userImg from '/images/user.png';
import '../../styles/userlist.scss';
import ListItem from './ListItem';
import UserIconDark from '~/assets/icons/user-dark.svg';
import { NavLink } from '@remix-run/react';
import { Menu } from '~/ai/components/Menu.client';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import '../../styles/ainmated-spinner.scss';
import { getDefaultReferral } from '~/ai/lib/stores/referrals';
import UserIcon from '~/assets/icons/user.svg';
import HelpIcon from '~/assets/icons/help.svg';
import SettingsIcon from '~/assets/icons/settings.svg';
import HomeIcon from '~/assets/icons/home.svg';
import DashboardIcon from '~/assets/icons/dashboard.svg';
import LogOutIcon from '~/assets/icons/sign-out.svg';
import Icon2 from '~/assets/icons/biela-animated-logo/2.svg';
import Icon3 from '~/assets/icons/biela-animated-logo/3.svg';
import { HeaderProps, ListItemType } from '~/components/types/componentTypes';
import { useUser } from '~/ai/lib/context/userContext';

const ListsItems = [
  {
    title: 'Dashboard',
    icon: DashboardIcon,
  },
  {
    title: 'Profile',
    icon: UserIcon,
  },
  {
    title: 'Billings', 
    icon: SettingsIcon,
  },
  {
    title: 'Referrals', 
    icon: SettingsIcon,
  },
  {
    title: 'Help',
    icon: HelpIcon,
  },
  {
    title: 'Log Out',
    icon: LogOutIcon,
  },
];

export function Header({ handleSendMessage, isStreaming, isDashboardPage, isSettingsPage }: HeaderProps = {}) {
  const chat = useStore(chatStore);
  const [showSettings, setShowSettings] = useState(false);

  const { isLoggedIn } = useUser();

  const settingsRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserIconClick = () => {
    if (!isLoggedIn()) {
      return;
    }

    setShowSettings(!showSettings);
  };

  const copyReferral = async () => {
    const url = await getDefaultReferral().catch();
    await navigator.clipboard.writeText(url).catch();
  };

  const [isBouncing, setIsBouncing] = useState<boolean | undefined>(false);
  useEffect(() => {
    const value = localStorage.getItem('isBouncing');
    setIsBouncing(value === 'true' ? true : value === 'false' ? false : undefined);
  }, [localStorage.getItem('isBouncing')]);

  return (
    <TooltipProvider>
      <header
        className={classNames('flex items-center px-5 h-[var(--header-height)] justify-between header-index', {
          'border-transparent': !chat.started,
          'border-biela-elements-borderColor': chat.started,
        })}
      >
        <div
          className="cursor-pointer max-width-edit"
          style={{ display: 'flex', gap: 'clamp(0px, calc(50vw - 188px - 16px), 300px)', zIndex: '10' }}
        >
          <div
            onMouseEnter={() => setMenuOpen(true)}
            onClick={() => (window.location.href = '/')}
            onMouseLeave={() => setMenuOpen(false)}
            className={'left-menu-open'}
            style={{ display: 'flex', gap: '8px', zIndex: '10' }}
          >
            {isStreaming ? (
              <>
                <div className={`animated-logo ${isBouncing ? 'bouncing' : ''}`}>
                  <img className="w-[100%] spiral" src={Icon2} alt="Logo" />
                  <img className="w-[100%] inner max-sm:hidden" src={Icon3} alt="Logo" />
                </div>
                <img className={'max-sm:hidden'} src="/icons/text-logo.svg" alt="Text Logo" />
              </>
            ) : (
              <>
                <img
                  src="/icons/logo-biela.svg"
                  style={{ minWidth: '40px', height: '40px', objectFit: 'cover' }}
                  alt="Logo"
                />
                <img className={'max-sm:hidden'} src="/icons/text-logo.svg" alt="Text Logo" />
              </>
            )}
          </div>

          {chat.started && !isDashboardPage && (
            <span className="flex items-center gap-2 flex-1 project-name-container">
              <span className="px-4 truncate text-center project-name-container-span text-biela-elements-textPrimary max-lg:w-full">
                <ClientOnly>{() => <ChatDescription />}</ClientOnly>
              </span>
            </span>
          )}
        </div>

        <Menu open={menuOpen} setOpen={setMenuOpen} isStreaming={isStreaming || false} />
        <div style={{ zIndex: '10' }} className="flex items-center justify-between gap-3 mt-[20px] pb-4">
          {handleSendMessage && (
            <>
              <div className="relative" ref={settingsRef}>
                {isLoggedIn() ? (
                  <img
                    className="bg-[#BEDDFF] min-w-[48px] h-[48px] rounded-full cursor-pointer"
                    src={userImg}
                    onClick={handleUserIconClick}
                    alt={''}
                  />
                ) : isDashboardPage || isSettingsPage ? (
                  <img
                    className="bg-[#BEDDFF] w-[48px] h-[48px] rounded-full cursor-pointer"
                    src={userImg}
                    onClick={() => setShowSettings(true)}
                    alt={''}
                  />
                ) : (
                  <NavLink to={'/signin'}>
                    <button className="cursor-pointer max-sm:max-w-[44px] shadow-sm ring-2 ring-[#86F49C] flex w-[136px] gap-2 items-center justify-center text-[black] py-[12px] px-[24px] bg-[#86F49C] rounded-full glass-button">
                      <img src={UserIconDark} style={{ minWidth: '18px' }} alt={''} />
                      <span className={'max-sm:hidden font-light'} style={{ fontSize: '14px' }}>
                        {' '}
                        Sign in
                      </span>
                    </button>
                  </NavLink>
                )}

                {showSettings ? (
                  <div
                    className={`${
                      chat.started ? 'user-list-chat-open' : 'user-list'
                    } z-[9999] w-max-content border border-[#2E2E2E] rounded-md mt-[10px] position-absolute h-full right-0`}
                    style={{ top: '60px' }}
                  >
                    <div className="py-[8px] px-[16px]">
                      <u className="no-underline no-list-style">
                        <ClientOnly>
                          {() =>
                            showSettings ? (
                              ListsItems.map((item: ListItemType, index: number) => (
                                <ListItem key={index} title={item.title} icon={item.icon} />
                              ))
                            ) : (
                              <></>
                            )
                          }
                        </ClientOnly>
                      </u>
                      <u>
                        <li
                          className="border border-transparent px-2.5 py-2 cursor-pointer relative rounded-lg
                 hover:border-[rgb(37,35,35)] border-[transparent]  flex user-list-item items-center w-[206px] text-black dark:text-white"
                        >
                          <div className="border-container-list">
                            <div className="light-border"></div>
                          </div>
                          <div className="flex gap-2">
                            <span onClick={copyReferral} className="ml-2 text-[14px] font-extralight">
                              Copy referral
                            </span>
                          </div>
                        </li>
                      </u>
                    </div>
                    {showSettings && (
                      <div className="text-black font-extralight dark:text-white list-footer align-items-center text-[14px] border-t light:border-[#E9E9E9] dark:border-[#2E2E2E]">
                        <div>Use of terms</div>
                        <div>Privacy</div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
