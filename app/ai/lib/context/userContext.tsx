import { createContext, memo, ReactNode, useContext, useMemo, useState } from 'react';
import { UserContextType, UserSession } from '~/types/user';
import { UserStore } from '~/ai/lib/stores/user/userStore';
import { createScopedLogger } from '~/utils/logger';

export const UserContext = createContext<UserContextType | null>(null);

const logger = createScopedLogger('UserContext');

/*
 * **User Global Context**
 *
 * This context is used by React components and has direct access to the User service.
 *
 * For helpers or generic functions, use the UserStore instance directly,
 * as the provider/context contains React hooks that should not be used outside of components.
 *
 * For an example of how to use the UserStore in non-React code, see the **lib/backend-api** module.
 */
export const UserProvider = memo(({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const userStore = UserStore.getInstance(setUser);

  useMemo(() => {
    logger.info(`Current user:`, JSON.stringify(user));

    if (!user) {
      setUser(userStore.getUser());
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        getUser: userStore.getUser.bind(userStore),
        setUser: userStore.setUser.bind(userStore),
        login: userStore.login.bind(userStore),
        logout: userStore.logout.bind(userStore),
        githubLogin: userStore.githubLogin.bind(userStore),
        confirmEmail: userStore.confirmEmail.bind(userStore),
        getToken: userStore.getToken.bind(userStore),
        isLoggedIn: userStore.isLoggedIn.bind(userStore),
        authenticateToken: userStore.authenticateToken.bind(userStore),
        getNewUserDataIfExpired: userStore.getNewUserDataIfExpired.bind(userStore),
      }}
    >
      {children}
    </UserContext.Provider>
  );
});

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
