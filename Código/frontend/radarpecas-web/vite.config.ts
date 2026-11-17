import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'placeholder-peca.svg'],
      manifest: {
        name: 'RadarPeças — Peças perto de você',
        short_name: 'RadarPeças',
        description: 'Encontre motopeças em estoque nas lojas perto de você.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#006375',
        categories: ['shopping', 'business'],
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/auth/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) =>
              request.method !== 'GET' && request.url.includes('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/busca'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'radarpecas-api-busca',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname.startsWith('/api/lojas') ||
                url.pathname.startsWith('/api/pecas') ||
                url.pathname.startsWith('/api/ofertas')),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'radarpecas-api-catalogo',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'radarpecas-api-geral',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'radarpecas-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            },
            {
              name: 'leaflet-vendor',
              test: /[\\/]node_modules[\\/]leaflet[\\/]/,
            },
            {
              name: 'lucide-vendor',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            },
          ],
        },
      },
    },
  },
});
