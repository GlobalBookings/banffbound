import { banffDateTime, type Booking } from './trip.ts';

export type BookingReminder = { bookingId: string; title: string; body: string; at: Date; fingerprint: string };

export function planBookingReminders(bookings: Booking[], options: { now?: Date; leadMinutes?: number } = {}): BookingReminder[] {
  const now = options.now ?? new Date();
  const leadMinutes = Math.max(0, Math.min(24 * 60, options.leadMinutes ?? 30));
  return bookings.flatMap(booking => {
    const departure = banffDateTime(booking.date, booking.time);
    if (!departure) return [];
    const at = new Date(departure.getTime() - leadMinutes * 60_000);
    if (at.getTime() <= now.getTime()) return [];
    const body = `${booking.time} Mountain Time · ${booking.markedBooked ? 'Marked booked by you' : 'Check your arrangements'}. Check your meeting point and return journey.`;
    return [{ bookingId: booking.id, title: booking.title, body, at, fingerprint: JSON.stringify([booking.title, body, at.toISOString()]) }];
  });
}
