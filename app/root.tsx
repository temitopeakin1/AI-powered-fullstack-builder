import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import './components/styles/font.scss';
import './ai/styles/fluid-animation.css';
import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './components/styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';
import { UserProvider, useUser } from './ai/lib/context/userContext';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.png',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },

  {
    rel: 'preload',
    href: globalStyles, // Update this with the most critical CSS file
    as: 'style',
    onLoad: "this.onload=null;this.rel='stylesheet';",
  },

  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Rexton:wght@400;500;600&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('biela_theme') ?? localStorage.getItem('data-theme');

    if (!theme) {
       theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>biela.dev</title>
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

/*
 * export function ErrorBoundary() {
 *   return (
 *     <html lang="en">
 *       <head>
 *         <meta charSet="utf-8" />
 *         <meta name="viewport" content="width=device-width, initial-scale=1" />
 *         <Meta />
 *         <Links />
 *       </head>
 *       <body>
 *         <ErrorPage />
 *         <ScrollRestoration />
 *         <Scripts />
 *         <LiveReload />
 *       </body>
 *     </html>
 *   );
 * }
 */

function AppContent() {
  const { githubLogin, isLoggedIn, authenticateToken, getNewUserDataIfExpired } = useUser();

  useEffect(() => {
    //@ts-ignore This function is loaded in the head script, therefore is not visible for Typescript, but it is called once the page loads.
    setTutorialKitTheme(); // Can be checked by modifying the script to return the theme and logging the result

    getNewUserDataIfExpired().then(async () => {
      if (!isLoggedIn()) {
        await authenticateToken();
      }
    });
  }, []);

  const location = useLocation();

  // save referral for later use if it exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(location.search);
      const referral = params.get('referral');
      const code = params.get('code');

      if (referral) {
        localStorage.setItem('referral', referral);
      }

      if (!code) {
        return;
      }

      githubLogin(code).then();

      params.delete('code');

      const newSearch = params.toString();
      history.pushState({}, '', window.location.pathname + (newSearch ? '?' + newSearch : ''));
    }
  }, [location.search]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
