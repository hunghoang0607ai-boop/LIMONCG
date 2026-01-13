import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '../types';
import {
  createResortRoom,
  deleteResortRoom,
  listResortRooms,
  updateResortRoom,
} from '../controllers/resortRoom.controller';
import { createResortGuest, listResortGuests } from '../controllers/resortGuest.controller';
import {
  createResortReservation,
  listResortReservations,
  updateResortReservationStatus,
} from '../controllers/resortReservation.controller';

const router = Router();

// All resort routes are admin-only in MVP
router.use(authenticate, authorize(UserRole.ADMIN));

const roomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1),
    name: z.string().optional(),
    type: z.enum(['STANDARD', 'DELUXE', 'SUITE']),
    capacity: z.number().int().min(1).max(20),
    baseRateCents: z.number().int().min(0),
    status: z.enum(['AVAILABLE', 'OUT_OF_SERVICE']).optional(),
    notes: z.string().optional(),
  }),
});

const roomUpdateSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1).optional(),
    name: z.string().optional(),
    type: z.enum(['STANDARD', 'DELUXE', 'SUITE']).optional(),
    capacity: z.number().int().min(1).max(20).optional(),
    baseRateCents: z.number().int().min(0).optional(),
    status: z.enum(['AVAILABLE', 'OUT_OF_SERVICE']).optional(),
    notes: z.string().optional(),
  }),
});

const guestSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const reservationSchema = z.object({
  body: z.object({
    roomId: z.string().uuid(),
    guestId: z.string().uuid().optional(),
    guest: z
      .object({
        fullName: z.string().min(2),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      })
      .optional(),
    checkInDate: z.string().min(1),
    checkOutDate: z.string().min(1),
    adults: z.number().int().min(1).max(20).optional(),
    children: z.number().int().min(0).max(20).optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']).optional(),
    totalCents: z.number().int().min(0).optional(),
    notes: z.string().optional(),
  }),
});

const reservationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']),
  }),
});

// Rooms
router.get('/rooms', listResortRooms);
router.post('/rooms', validate(roomSchema), createResortRoom);
router.put('/rooms/:id', validate(roomUpdateSchema), updateResortRoom);
router.delete('/rooms/:id', deleteResortRoom);

// Guests
router.get('/guests', listResortGuests);
router.post('/guests', validate(guestSchema), createResortGuest);

// Reservations
router.get('/reservations', listResortReservations);
router.post('/reservations', validate(reservationSchema), createResortReservation);
router.patch('/reservations/:id/status', validate(reservationStatusSchema), updateResortReservationStatus);

export default router;

