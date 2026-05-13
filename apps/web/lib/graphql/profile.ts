import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      displayName
      role
      profileImageUrl
      preferences
      createdAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      displayName
      profileImageUrl
      preferences
    }
  }
`;

export const GET_STAFF_LIST = gql`
  query GetStaffList {
    staffList {
      id
      email
      displayName
      role
      createdAt
    }
  }
`;
