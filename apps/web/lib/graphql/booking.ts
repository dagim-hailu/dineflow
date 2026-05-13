import { gql } from '@apollo/client';

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      date
      time
      partySize
      status
      guestName
      guestEmail
      guestPhone
      specialRequest
      createdAt
    }
  }
`;

export const MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      date
      time
      partySize
      status
      specialRequest
      guestName
      createdAt
    }
  }
`;

export const RESTAURANT_BOOKINGS = gql`
  query Bookings($restaurantId: ID!, $date: String) {
    bookings(restaurantId: $restaurantId, date: $date) {
      id
      date
      time
      partySize
      status
      guestName
      guestEmail
      guestPhone
      specialRequest
      createdAt
    }
  }
`;

export const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DEMO_RESTAURANT_ID = 'a0000000-0000-4000-8000-000000000001';
