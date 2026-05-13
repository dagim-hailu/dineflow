import { NextResponse } from 'next/server';

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Use email instead of username to match the backend expectation
    const email = username;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Username (email) and password are required' },
        { status: 400 },
      );
    }

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
      return NextResponse.json({ error: 'GraphQL HTTP error' }, { status: res.status });
    }

    const payload = await res.json();

    if (payload.errors?.length) {
      return NextResponse.json({ error: payload.errors[0].message }, { status: 401 });
    }

    // Extract the Set-Cookie header to get the token (since the GraphQL mutation sets it via cookie)
    const setCookieHeader = res.headers.get('set-cookie');

    let token = null;
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/dineflow_token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        token = tokenMatch[1];
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      user: payload.data?.login?.user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
