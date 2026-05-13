import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { bookings } from '../../infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBookingInput } from './dto/create-booking.input';

@Injectable()
export class BookingService {
  constructor(private readonly db: DatabaseService) {}

  async createBooking(input: CreateBookingInput, userId?: string) {
    const [booking] = await this.db.db
      .insert(bookings)
      .values({
        restaurantId: input.restaurantId,
        userId: userId ?? null,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone ?? null,
        date: input.date,
        time: input.time,
        partySize: input.partySize,
        specialRequest: input.specialRequest ?? null,
        status: 'pending',
      })
      .returning();
    return booking;
  }

  async myBookings(userId: string) {
    return this.db.db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async bookingsByRestaurant(restaurantId: string, date?: string) {
    const conditions = [eq(bookings.restaurantId, restaurantId)];
    if (date) conditions.push(eq(bookings.date, date));
    return this.db.db
      .select()
      .from(bookings)
      .where(and(...conditions));
  }

  async updateBookingStatus(id: string, status: string) {
    const [updated] = await this.db.db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }
}
