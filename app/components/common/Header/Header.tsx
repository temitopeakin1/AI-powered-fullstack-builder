import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from '@remix-run/react';
import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/ai/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { ChatDescription } from '~/ai/lib/persistence/ChatDescription.client';
import userImg from '/images/user.png';
import '../../styles/userlist.scss';
import ListItem from './ListItem';
import UserIconDark from '~/assets/icons/user-dark.svg';
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
import MobileMenu from './MobileMenu';
import { motion, AnimatePresence } from 'framer-motion';

const ListsItems = [
  { title: 'Home', icon: HomeIcon },
  { title: 'Dashboard', icon: DashboardIcon },
  { title: 'Leaderboard', icon: DashboardIcon },
  { title: 'Profile', icon: UserIcon },
  { title: 'Settings', icon: SettingsIcon },
  { title: 'Help', icon: HelpIcon },
  { title: 'Log Out', icon: LogOutIcon },
];

export function Header({ handleSendMessage, isStreaming, isDashboardPage, isSettingsPage }: HeaderProps = {}) {
  const chat = useStore(chatStore);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn } = useUser();
  const settingsRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState<boolean | undefined>(false);

  useEffect(() => {
    const value = localStorage.getItem('isBouncing');
    setIsBouncing(value === 'true' ? true : value === 'false' ? false : undefined);
  }, [localStorage.getItem('isBouncing')]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('body-blur');
    } else {
      document.body.classList.remove('body-blur');
    }

    return () => {
      document.body.classList.remove('body-blur');
    };
  }, [isMobileMenuOpen]);

  const handleUserIconClick = () => {
    if (!isLoggedIn()) return;
    setShowSettings(!showSettings);
  };

  const copyReferral = async () => {
    const url = await getDefaultReferral().catch();
    await navigator.clipboard.writeText(url).catch();
  };

  return (
    <TooltipProvider>
      <header
        className={classNames(
          'flex items-center px-5 h-[var(--header-height)] justify-between header-index relative z-50',
          chat.started ? 'border-biela-elements-borderColor' : 'border-transparent',
        )}
      >
        <div className="cursor-pointer max-width-edit flex gap-[clamp(0px,calc(50vw-188px-16px),300px)] z-10">
          <div
            className="left-menu-open flex gap-2 z-10"
            onMouseEnter={() => setMenuOpen(true)}
            onClick={() => (window.location.href = '/')}
            onMouseLeave={() => setMenuOpen(false)}
          >
            {isStreaming ? (
              <>
                <div className={`animated-logo ${isBouncing ? 'bouncing' : ''}`}>
                  <img className="w-full spiral" src={Icon2} alt="Logo" />
                  <img className="w-full inner max-sm:hidden" src={Icon3} alt="Logo" />
                </div>
                <img className="max-sm:hidden" src="/icons/text-logo.svg" alt="Text Logo" />
              </>
            ) : (
              <>
                <img className="min-w-[40px] h-[40px] object-cover" src="/icons/logo-biela.svg" alt="Logo" />
                <img className="max-sm:hidden" src="/icons/text-logo.svg" alt="Text Logo" />
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

        {!isLoggedIn() ? (
          <NavLink to="/signin" className="lg:hidden">
            <button className="w-10 h-10 cursor-pointer shadow-sm ring-2 ring-[#86F49C] flex items-center justify-center text-black p-2 bg-[#86F49C] rounded-full glass-button">
              <img src={UserIconDark} className="w-6 h-6 " alt="User icon" />
            </button>
          </NavLink>
        ) : (
          <button
            className="lg:hidden z-50 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white relative rounded-lg isolate base-chat m-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.svg
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-between gap-3 mt-5 pb-4 z-10">
          {handleSendMessage && (
            <div className="relative" ref={settingsRef}>
              {isLoggedIn() ? (
                <img
                  className="bg-[#BEDDFF] min-w-[48px] h-[48px] rounded-full cursor-pointer"
                  src={userImg}
                  onClick={handleUserIconClick}
                  alt="User avatar"
                />
              ) : isDashboardPage || isSettingsPage ? (
                <img
                  className="bg-[#BEDDFF] w-[48px] h-[48px] rounded-full cursor-pointer"
                  src={userImg}
                  onClick={() => setShowSettings(true)}
                  alt="User avatar"
                />
              ) : (
                <NavLink to="/signin">
                  <button className="cursor-pointer shadow-sm ring-2 ring-[#86F49C] flex w-[136px] gap-2 items-center justify-center text-black py-3 px-6 bg-[#86F49C] rounded-full glass-button">
                    <img src={UserIconDark} className="min-w-[18px]" alt="User icon" />
                    <span className="font-light text-sm">Sign in</span>
                  </button>
                </NavLink>
              )}

              {showSettings && (
                <div
                  className={`${
                    chat.started ? 'user-list-chat-open' : 'user-list'
                  } z-[9999] w-max-content border border-[#2E2E2E] rounded-md mt-[10px] absolute top-[60px] right-0`}
                >
                  <div className="py-2 px-4">
                    <u className="no-underline no-list-style">
                      <ClientOnly>
                        {() =>
                          showSettings &&
                          ListsItems.map((item: ListItemType, index: number) => (
                            <ListItem key={index} title={item.title} icon={item.icon} />
                          ))
                        }
                      </ClientOnly>
                    </u>
                    <u>
                      <li className="border border-transparent px-2.5 py-2 cursor-pointer relative rounded-lg hover:border-[rgb(37,35,35)] flex user-list-item items-center w-[206px] text-black dark:text-white">
                        <div className="border-container-list">
                          <div className="light-border"></div>
                        </div>
                        <div className="flex gap-2">
                          <span onClick={copyReferral} className="ml-2 text-sm font-extralight">
                            Copy referral
                          </span>
                        </div>
                      </li>
                    </u>
                  </div>
                  <div className="text-black font-extralight dark:text-white list-footer items-center text-sm border-t light:border-[#E9E9E9] dark:border-[#2E2E2E]">
                    <div>Use of terms</div>
                    <div>Privacy</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoggedIn() && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            ListsItems={ListsItems}
            isLoggedIn={isLoggedIn()}
          />
        )}
      </header>
    </TooltipProvider>
  );
}