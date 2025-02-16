import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/ai/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  try {
    const host = request.headers.get('host');
    const appMainUrlEnv = import.meta.env.CUSTOM_BASE_URL;

    if (appMainUrlEnv && host) {
      const appMainUrl = new URL(appMainUrlEnv);

      if (host !== appMainUrl.host) {
        const redirectUrl = new URL(request.url);
        redirectUrl.host = appMainUrl.host;
        redirectUrl.protocol = appMainUrl.protocol;

        return new Response(null, {
          status: 301,
          headers: {
            Location: redirectUrl.toString(),
          },
        });
      }
    }

    const readable = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
      signal: request.signal,
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    });

    const body = new ReadableStream({
      start(controller) {
        const head = renderHeadToString({ request, remixContext, Head });

        controller.enqueue(
          new Uint8Array(
            new TextEncoder().encode(
              `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
            ),
          ),
        );

        const reader = readable.getReader();

        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.enqueue(new Uint8Array(new TextEncoder().encode('</div></body></html>')));
                controller.close();

                return;
              }

              controller.enqueue(value);
              read();
            })
            .catch((error) => {
              controller.error(error);
              readable.cancel();
            });
        }

        read();
      },

      cancel() {
        readable.cancel();
      },
    });

    if (isbot(request.headers.get('user-agent') || '')) {
      await readable.allReady;
    }

    responseHeaders.set('Content-Type', 'text/html');

    /*
     * if none of the bypass patterns match, set the Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers
     * reason: these headers will break auth mechanism
     */
    const bypassPatterns = [`${import.meta.env.CUSTOM_BACKEND_API}`, 'magic'];

    if (!bypassPatterns.some((pattern) => request.url.includes(pattern))) {
      responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
    }

    return new Response(body, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  } catch (error) {
    console.error('SSR error:', error);
    return new Response(error?.toString(), {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
