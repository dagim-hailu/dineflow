import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      items {
        menuItemId
        quantity
        notes
        addedAt
      }
      tableId
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($menuItemId: ID!) {
    removeFromCart(menuItemId: $menuItemId) {
      items {
        menuItemId
        quantity
        notes
        addedAt
      }
      tableId
      createdAt
      updatedAt
    }
  }
`;

export const GET_CART = gql`
  query GetCart {
    cart {
      items {
        menuItemId
        quantity
        notes
        addedAt
      }
      tableId
      createdAt
      updatedAt
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      id
      status
      totalAmount
      specialInstructions
      createdAt
      updatedAt
      table {
        id
        tableNumber
        restaurantId
      }
      items {
        id
        quantity
        price
      }
    }
  }
`;
