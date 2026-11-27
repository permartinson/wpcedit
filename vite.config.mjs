import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// The router uses '/wpcedit' (no trailing slash) for the home page. Vite
// only serves the app at '/wpcedit/', so redirect when the page is reloaded.
function redirectToBase() {
  const redirect = (req, res, next) => {
    if (req.url === '/wpcedit') {
      res.writeHead(301, { Location: '/wpcedit/' });
      res.end();
      return;
    }
    next();
  };
  return {
    name: 'redirect-to-base',
    configureServer(server) { server.middlewares.use(redirect); },
    configurePreviewServer(server) { server.middlewares.use(redirect); },
  };
}

// `npm run dev:local` uses the source code of the WPCEdit.js library in
// ../js/wpcedit.js instead of the version installed from npm, so changes to
// the library show up in the app right away, without building it first.
const localLibrary = fileURLToPath(new URL('../js/wpcedit.js/src/WPCEdit.ts', import.meta.url));

function libraryAlias(mode) {
  if (mode !== 'locallib') {
    return {};
  }
  if (!existsSync(localLibrary)) {
    throw new Error(`dev:local needs the WPCEdit.js library at ${localLibrary}`);
  }
  return { wpcedit: localLibrary };
}

export default defineConfig(({ mode }) => ({
  // The app is published at https://permartinson.github.io/wpcedit/
  base: '/wpcedit/',
  plugins: [
    vue(),
    redirectToBase(),
    VitePWA({
      // The service worker is registered in src/registerServiceWorker.js
      injectRegister: false,
      // Same file names as with Vue CLI, so installed copies of the app update
      filename: 'service-worker.js',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.ico', 'robots.txt', 'img/icons/*'],
      manifest: {
        name: 'WPC Edit',
        short_name: 'WPC Edit',
        theme_color: '#2D2D2D',
        background_color: '#000000',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: './img/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: './img/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: './img/icons/android-chrome-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: './img/icons/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...libraryAlias(mode),
    },
  },
  server: {
    // Same address as before: http://localhost:8080/wpcedit/
    port: 8080,
    fs: {
      // let the dev server read the library folder in dev:local mode
      allow: mode === 'locallib' ? ['.', '../js/wpcedit.js'] : ['.'],
    },
  },
  test: {
    // localStorage, window and document for the store and export helpers
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
  },
}));
