import type { OpenAPIObject } from '@nestjs/swagger';

const GRAPHQL_DESCRIPTION = `
## GraphQL over HTTP

All business operations use **POST /graphql** with a JSON body:

\`\`\`json
{ "query": "string", "variables": {}, "operationName": "optional" }
\`\`\`

### Auth

- **Registered users:** JWT in \`Authorization: Bearer <token>\` **or** HttpOnly cookie \`dineflow_token\` (set by \`login\` / \`register\`).
- **Guests:** HttpOnly cookie \`dineflow_guest\` (set by \`guestSession\`).

Postman: enable the cookie jar or paste \`Cookie\` headers after running auth mutations.

### Active operations (resolvers)

**Queries:** \`hello\`, \`me\`, \`menu\`, \`menuItem\`, \`menuItemsByRestaurant\`, \`menuItemsByTable\`

**Mutations:** \`register\`, \`login\`, \`guestSession\`, \`logout\`, \`refreshToken\` (throws), \`createMenuItem\`, \`updateMenuItem\`, \`deleteMenuItem\`, \`toggleMenuItemAvailability\`

**Order (optional):** \`cart\`, \`addToCart\`, \`removeFromCart\`, \`clearCart\`, \`placeOrder\`, \`order\`, \`myOrders\`, \`updateOrderStatus\` — require \`OrderModule\` registered in \`AppModule\` if not already present.

Use **GraphQL Playground** at the same origin when \`GRAPHQL_PLAYGROUND\` is enabled, or the Postman collection in \`docs/postman/\`.
`.trim();

/**
 * Adds a documented POST /graphql entry to the OpenAPI document (Nest GraphQL has no REST controllers).
 */
export function augmentOpenApiWithGraphql(doc: OpenAPIObject): OpenAPIObject {
  const paths = doc.paths ?? {};
  paths['/graphql'] = {
    post: {
      tags: ['GraphQL'],
      summary: 'Execute a GraphQL operation',
      description: GRAPHQL_DESCRIPTION,
      operationId: 'graphqlExecute',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['query'],
              properties: {
                query: {
                  type: 'string',
                  description: 'GraphQL document (query, mutation, or subscription)',
                },
                variables: {
                  type: 'object',
                  additionalProperties: true,
                  description: 'Variables for the operation',
                },
                operationName: {
                  type: 'string',
                  description: 'Optional operation name when the document defines several',
                },
              },
            },
            examples: {
              hello: {
                summary: 'hello',
                value: { query: '{ hello }' },
              },
              menuByTable: {
                summary: 'menu(tableId)',
                value: {
                  query:
                    'query Menu($tableId: ID!) { menu(tableId: $tableId) { categories { id name items { id name price } } } }',
                  variables: {
                    tableId: '00000000-0000-4000-8000-000000000001',
                  },
                },
              },
              login: {
                summary: 'login',
                value: {
                  query:
                    'mutation Login($input: LoginInput!) { login(input: $input) { user { id email displayName role } } }',
                  variables: {
                    input: { email: 'test@example.com', password: 'password' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'GraphQL JSON response (data and/or errors)',
        },
        '400': { description: 'Bad request (malformed GraphQL or validation)' },
      },
      security: [{ bearer: [] }, { cookieToken: [] }, { cookieGuest: [] }],
    },
  };
  doc.paths = paths;

  doc.components = doc.components ?? {};
  doc.components.securitySchemes = {
    ...(doc.components.securitySchemes ?? {}),
    bearer: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT from login response header or app flow',
    },
    cookieToken: {
      type: 'apiKey',
      in: 'cookie',
      name: 'dineflow_token',
      description: 'HttpOnly cookie set by login/register',
    },
    cookieGuest: {
      type: 'apiKey',
      in: 'cookie',
      name: 'dineflow_guest',
      description: 'HttpOnly cookie set by guestSession',
    },
  };

  return doc;
}
