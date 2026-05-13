import { gql } from '@apollo/client';

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      totalAmount
      createdAt
      updatedAt
      table {
        id
        tableNumber
      }
      items {
        id
        quantity
        price
        menuItem {
          id
          name
          imageUrl
        }
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      totalAmount
      specialInstructions
      createdAt
      updatedAt
      guestId
      table {
        id
        tableNumber
        restaurantId
      }
      customer {
        id
        displayName
        email
      }
      items {
        id
        quantity
        price
        notes
        menuItem {
          id
          name
          description
          imageUrl
        }
      }
    }
  }
`;

export const GET_KITCHEN_ORDERS = gql`
  query GetKitchenOrders($restaurantId: ID) {
    kitchenOrders(restaurantId: $restaurantId) {
      id
      status
      totalAmount
      createdAt
      table {
        id
        tableNumber
      }
      items {
        id
        quantity
        menuItem {
          id
          name
        }
      }
    }
  }
`;
