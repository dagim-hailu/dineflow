import { gql } from '@apollo/client';

export const GUEST_SESSION = gql`
  mutation GuestSession($input: GuestSessionInput!) {
    guestSession(input: $input) {
      sessionId
      expiresAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        displayName
        role
        profileImageUrl
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        displayName
        role
        profileImageUrl
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      displayName
      role
      profileImageUrl
      preferences
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const GET_PAGINATED_USERS = gql`
  query GetPaginatedUsers($search: String, $role: UserRole, $limit: Int!, $offset: Int!) {
    paginatedUsers(search: $search, role: $role, limit: $limit, offset: $offset) {
      items {
        id
        email
        displayName
        role
        createdAt
      }
      totalCount
    }
  }
`;
