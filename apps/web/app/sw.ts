import { defaultCache } from '@serwist/next/worker';
import { CacheableResponsePlugin, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

// This declares that `self.__SW_MANIFEST` is injected by Serwist at build time
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    navigateFallback: '/offline',
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Network-first for GraphQL API — works offline with stale data
    {
      matcher: ({ url }) => url.pathname === '/graphql',
      handler: new NetworkFirst({
        cacheName: 'graphql-cache',
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },
    // Default cache strategies for all other requests
    ...defaultCache,
  ],
});

serwist.addEventListeners();
