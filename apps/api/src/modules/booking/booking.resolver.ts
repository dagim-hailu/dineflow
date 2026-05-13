import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { Booking } from './models/booking.model';
import { CreateBookingInput } from './dto/create-booking.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Booking)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  /** Guests & logged-in users can create bookings */
  @Public()
  @Mutation(() => Booking)
  async createBooking(
    @Args('input') input: CreateBookingInput,
    @CurrentUser() user?: { id: string },
  ): Promise<Booking> {
    return this.bookingService.createBooking(input, user?.id);
  }

  /** Logged-in customer views their own bookings */
  @Query(() => [Booking])
  async myBookings(@CurrentUser() user: { id: string }): Promise<Booking[]> {
    return this.bookingService.myBookings(user.id);
  }

  /** Staff queries bookings for a restaurant */
  @Query(() => [Booking])
  async bookings(
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @Args('date', { nullable: true }) date?: string,
  ): Promise<Booking[]> {
    return this.bookingService.bookingsByRestaurant(restaurantId, date);
  }

  /** Staff updates booking status */
  @Mutation(() => Booking)
  async updateBookingStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
  ): Promise<Booking> {
    return this.bookingService.updateBookingStatus(id, status);
  }
}
