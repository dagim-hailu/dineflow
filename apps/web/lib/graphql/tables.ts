import { gql } from '@apollo/client';

export const GET_TABLES = gql`
  query GetTables($restaurantId: ID) {
    tables(restaurantId: $restaurantId) {
      id
      restaurantId
      tableNumber
      status
      currentWaiterId
      qrUuid
    }
  }
`;
