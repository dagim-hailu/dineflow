import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        displayName
        role
      }
    }
  }
`;

function graphqlUrl(): string {
  return (
    process.env.INTERNAL_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/graphql'
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) {
          return null;
        }

        try {
          const res = await fetch(graphqlUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: LOGIN_MUTATION,
              variables: {
                input: {
                  email,
                  password,
                },
              },
            }),
          });

          if (!res.ok) {
            console.error('[NextAuth] GraphQL HTTP', res.status, await res.text());
            return null;
          }

          const payload = (await res.json()) as {
            errors?: { message: string }[];
            data?: {
              login?: {
                user?: {
                  id: string;
                  email?: string | null;
                  displayName?: string | null;
                  role?: string;
                };
              };
            };
          };

          if (payload.errors?.length) {
            console.error('[NextAuth] GraphQL errors', payload.errors);
            return null;
          }

          const user = payload.data?.login?.user;
          if (!user?.id) {
            return null;
          }

          return {
            id: user.id,
            email: user.email ?? email,
            name: user.displayName || user.email || email || 'User',
            role: user.role ?? 'customer',
          };
        } catch (e) {
          console.error('[NextAuth] authorize fetch failed', e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
