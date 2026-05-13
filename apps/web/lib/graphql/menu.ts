import { gql } from '@apollo/client';

/** Table UUID used on the marketing homepage when `NEXT_PUBLIC_DEMO_TABLE_ID` is unset. */
export const DEFAULT_DEMO_TABLE_ID =
  process.env.NEXT_PUBLIC_DEMO_TABLE_ID ?? '00000000-0000-4000-8000-000000000001';

export const GET_MENU = gql`
  query Menu($tableId: ID!) {
    menu(tableId: $tableId) {
      restaurantId
      tableId
      categories {
        id
        name
        nameAm
        description
        descriptionAm
        items {
          id
          name
          nameAm
          description
          descriptionAm
          price
          imageUrl
          isAvailable
          prepTime
        }
      }
    }
  }
`;

export const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      id
      name
      nameAm
      description
      descriptionAm
      price
      imageUrl
      isAvailable
      prepTime
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem($input: UpdateMenuItemInput!) {
    updateMenuItem(input: $input) {
      id
      name
      nameAm
      description
      descriptionAm
      price
      imageUrl
      isAvailable
      prepTime
    }
  }
`;

export const GET_PAGINATED_MENU_ITEMS = gql`
  query GetPaginatedMenuItems(
    $search: String
    $categoryId: ID
    $isAvailable: Boolean
    $restaurantId: ID
    $tableId: ID
    $limit: Int!
    $offset: Int!
  ) {
    paginatedMenuItems(
      search: $search
      categoryId: $categoryId
      isAvailable: $isAvailable
      restaurantId: $restaurantId
      tableId: $tableId
      limit: $limit
      offset: $offset
    ) {
      items {
        id
        name
        nameAm
        description
        descriptionAm
        price
        imageUrl
        isAvailable
        prepTime
        categoryId
        restaurantId
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem($id: ID!) {
    deleteMenuItem(id: $id)
  }
`;
