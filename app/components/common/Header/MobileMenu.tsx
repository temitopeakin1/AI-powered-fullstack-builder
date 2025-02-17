import React from 'react';
import { NavLink } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  ListsItems: Array<{
    title: string;
    icon: string;
  }>;
  isLoggedIn: boolean;
}

const MobileMenu = ({ isOpen, onClose, ListsItems, isLoggedIn }: MobileMenuProps) => {
  const getItemPath = (title: string) => {
    switch (title.toLowerCase()) {
      case 'home':
        return '/';
      case 'profile':
        return '/settings/profile';
      case 'settings':
        return '/settings/billing';
      case 'help':
        return '/help';
      case 'log out':
        return '/logout';
      default:
        return `/${title.toLowerCase()}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[5px] z-30"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              height: {
                duration: 0.4,
              },
            }}
            className="rounded-lg z-40 shadow-lg overflow-hidden border border-[#2E2E2E]"
            style={{
              position: 'absolute',
              top: 'var(--header-height)',
              left: 16,
              right: 16,
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(31, 31, 31, 0.8) 100%)',
            }}
          >
            <div className="flex flex-col">
              <div className="overflow-y-auto py-6 px-4">
                <nav className="space-y-4">
                  {ListsItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={getItemPath(item.title)}
                        className="flex items-center p-4 text-gray-100 hover:bg-gray-800/50 rounded-lg transition-colors duration-150"
                        onClick={onClose}
                      >
                        <img src={item.icon} alt="" className="w-6 h-6 mr-4" />
                        <span className="text-lg font-medium">{item.title}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t border-gray-700">
                {!isLoggedIn && (
                  <NavLink
                    to="/signin"
                    className="flex items-center justify-center w-full p-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150"
                    onClick={onClose}
                  >
                    Sign In
                  </NavLink>
                )}
                <div className="text-sm px-4 flex justify-between ">
                  <a href="" className="text-white hover:text-gray-300 transition-colors duration-150">
                    Use of terms
                  </a>
                  <a href="" className="text-white hover:text-gray-300 transition-colors duration-150">
                    Privacy
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;