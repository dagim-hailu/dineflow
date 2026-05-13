'use client';

import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import apolloClient from '../lib/apollo-client';
import { PwaManager } from './pwa-manager';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <SessionProvider>
        <PwaManager />
        {children}
      </SessionProvider>
    </ApolloProvider>
  );
}
