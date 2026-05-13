const NEXT_URL = 'http://localhost';
const GRAPHQL_URL = 'http://localhost/graphql';

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

const GET_MENU_QUERY = `
  query Menu($tableId: ID!) {
    menu(tableId: $tableId) {
      restaurantId
      categories {
        id
        name
      }
    }
  }
`;

const CREATE_MENU_ITEM_MUTATION = `
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      id
      name
      price
      categoryId
    }
  }
`;

async function main() {
  console.log('Testing with Manager Account...');

  // 1. Test Next.js test API endpoint
  console.log('Calling Next.js /api/auth/test-login...');
  const loginRes = await fetch(`${NEXT_URL}/api/test-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'manager@example.com', password: 'password123' }),
  });

  const loginData = await loginRes.json();
  if (!loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('Login successful. Token:', loginData.token?.substring(0, 20) + '...');

  const token = loginData.token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // If API supports bearer
    Cookie: `dineflow_token=${token}`, // API definitely supports cookie
  };

  // 2. Fetch Menu to get categories and restaurantId
  console.log('Fetching Menu Categories...');
  const menuRes = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: GET_MENU_QUERY,
      variables: { tableId: '00000000-0000-4000-8000-000000000001' },
    }),
  });

  const menuData = await menuRes.json();
  const menu = menuData.data.menu;
  const restaurantId = menu.restaurantId;
  const categories = menu.categories;

  const foodCategory =
    categories.find(
      (c: any) =>
        c.name.toLowerCase().includes('lunch') ||
        c.name.toLowerCase().includes('dinner') ||
        c.name.toLowerCase().includes('food'),
    )?.id || categories[0].id;
  const drinkCategory =
    categories.find((c: any) => c.name.toLowerCase().includes('drink'))?.id ||
    categories[1]?.id ||
    categories[0].id;

  console.log('Using Restaurant ID:', restaurantId);

  // 3. Create 3 Menu Items
  const itemsToCreate = [
    {
      name: 'Spicy Truffle Burger',
      price: 15.99,
      categoryId: foodCategory,
      description: 'Delicious spicy burger with truffle sauce.',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      restaurantId,
    },
    {
      name: 'Mango Passion Smoothie',
      price: 6.5,
      categoryId: drinkCategory,
      description: 'Refreshing tropical smoothie.',
      imageUrl:
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80',
      restaurantId,
    },
    {
      name: 'Loaded Nachos',
      price: 9.99,
      categoryId: foodCategory,
      description: 'Crispy nachos with melted cheese and jalapeños.',
      imageUrl:
        'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
      restaurantId,
    },
  ];

  console.log('Creating 3 menu items...');
  for (const item of itemsToCreate) {
    const createRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: CREATE_MENU_ITEM_MUTATION,
        variables: { input: item },
      }),
    });
    const createData = await createRes.json();
    if (createData.errors) {
      console.error('Failed to create item:', item.name, createData.errors);
    } else {
      console.log('Successfully created:', createData.data.createMenuItem.name);
    }
  }

  // 4. Verify access control: Try with customer account
  console.log('\nTesting with Customer Account...');
  const customerLoginRes = await fetch(`${NEXT_URL}/api/test-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'customer@example.com', password: 'password123' }),
  });

  const customerLoginData = await customerLoginRes.json();
  const customerToken = customerLoginData.token;

  const customerHeaders = {
    'Content-Type': 'application/json',
    Cookie: `dineflow_token=${customerToken}`,
  };

  const customerCreateRes = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify({
      query: CREATE_MENU_ITEM_MUTATION,
      variables: { input: { ...itemsToCreate[0], name: 'Unauthorized Burger' } },
    }),
  });

  const customerCreateData = await customerCreateRes.json();
  if (
    customerCreateData.errors &&
    (customerCreateData.errors[0].message.includes('Forbidden') ||
      customerCreateData.errors[0].message.includes('role') ||
      customerCreateData.errors[0].message.includes('Insufficient'))
  ) {
    console.log('SUCCESS: Customer was blocked from creating a menu item.');
  } else {
    console.error('FAILURE: Customer could create a menu item!', customerCreateData);
  }
}

main().catch(console.error);
