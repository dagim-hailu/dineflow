import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split } from '@apollo/client';

/**
 * Resolve GraphQL HTTP URL per request (not at module load).
 * Module-level `window === undefined` runs during client-bundle SSR and would wrongly
 * pin `http://api:3001` into the browser if we baked the URI once at import time.
 */
function resolveGraphqlHttpUri(): string {
  if (typeof window === 'undefined' && process.env.INTERNAL_GRAPHQL_URL) {
    return process.env.INTERNAL_GRAPHQL_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql';
}

const httpLink = new HttpLink({
  credentials: 'include',
  uri: resolveGraphqlHttpUri,
});

const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();

const wsLink =
  typeof window !== 'undefined' && wsUrl
    ? new GraphQLWsLink(
        createClient({
          url: wsUrl,
          connectionParams: () => ({}),
        }),
      )
    : null;

const authLink = setContext((_, { headers }) => {
  let guestToken = null;
  let accessToken = null;

  if (typeof window !== 'undefined') {
    // Read from CartStore persistence
    const cartStore = localStorage.getItem('dineflow-cart');
    if (cartStore) {
      try {
        guestToken = JSON.parse(cartStore).state.guestToken;
      } catch (e) {}
    }

    // Read from AuthStore persistence
    const authStore = localStorage.getItem('dineflow-auth');
    if (authStore) {
      try {
        accessToken = JSON.parse(authStore).state.accessToken;
      } catch (e) {}
    }
  }

  return {
    headers: {
      ...headers,
      ...(guestToken ? { 'x-guest-token': guestToken } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );

  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          );
        },
        wsLink,
        from([authLink, errorLink, httpLink]),
      )
    : from([authLink, errorLink, httpLink]);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          menuItems: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          orders: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
