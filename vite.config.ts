import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Get git hash with fallback
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'no-git-info';
  }
};

export default defineConfig((config) => {
  return {
    define: {
      __COMMIT_HASH: JSON.stringify(getGitHash()),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),

      // 'process.env': JSON.stringify(process.env)
    },
    server: {
      host: true,
      allowedHosts: ['.biela.dev', '.b0x.site', '.ondigitalocean.app'],
      hmr: {
        protocol: 'ws',
        overlay: false, // Disable error overlays that trigger reloads
      },
      watch: {
        usePolling: false, // Disable polling to reduce unnecessary triggers
        ignored: ['**/node_modules/**', '**/.git/**'], // Ignore folders that trigger false events
      },
    },
    preview: {
      host: true,
      allowedHosts: ['.biela.dev', '.b0x.site', '.ondigitalocean.app'],
    },
    build: {
      target: 'esnext',
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer', 'process'],
      }),
      config.mode !== 'temp' && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    envPrefix: ['VITE_', 'OPENAI_LIKE_API_', 'OLLAMA_API_BASE_URL', 'LMSTUDIO_API_BASE_URL', 'CUSTOM_','SUPA_'],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    server: {
      allowedHosts: ['dev-ide.biela.dev'], // Add the required host
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}
