import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

const parseISODate = (value: string): Date => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest('Invalid date format');
  return d;
};

/**
 * @desc    List reservations
 * @route   GET /api/v1/resort/reservations
 * @access  Private/Admin
 */
export const listResortReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, from, to } = req.query;

  const where: any = {};
  if (status) where.status = status;

  if (from || to) {
    where.AND = [];
    if (from) where.AND.push({ checkOutDate: { gt: parseISODate(from as string) } });
    if (to) where.AND.push({ checkInDate: { lt: parseISODate(to as string) } });
  }

  const reservations = await prisma.resortReservation.findMany({
    where,
    include: {
      room: true,
      guest: true,
    },
    orderBy: [{ checkInDate: 'asc' }, { createdAt: 'desc' }],
  });

  sendSuccess(res, reservations);
});

/**
 * @desc    Create reservation (supports inline guest creation)
 * @route   POST /api/v1/resort/reservations
 * @access  Private/Admin
 */
export const createResortReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    roomId,
    guestId,
    guest,
    checkInDate,
    checkOutDate,
    adults = 1,
    children = 0,
    status = 'CONFIRMED',
    totalCents,
    notes,
  } = req.body;

  if (!roomId) throw ApiError.badRequest('roomId is required');
  if (!checkInDate || !checkOutDate) throw ApiError.badRequest('checkInDate and checkOutDate are required');

  const checkIn = parseISODate(checkInDate);
  const checkOut = parseISODate(checkOutDate);
  if (checkOut <= checkIn) throw ApiError.badRequest('checkOutDate must be after checkInDate');

  const room = await prisma.resortRoom.findUnique({ where: { id: roomId } });
  if (!room) throw ApiError.notFound('Room not found');

  if (room.status === 'OUT_OF_SERVICE') {
    throw ApiError.badRequest('Room is OUT_OF_SERVICE');
  }

  // Create or use guest
  let finalGuestId = guestId as string | undefined;
  if (!finalGuestId) {
    if (!guest?.fullName) throw ApiError.badRequest('guest.fullName is required when guestId is not provided');

    const createdGuest = await prisma.resortGuest.create({
      data: {
        fullName: guest.fullName,
        email: guest.email,
        phone: guest.phone,
        notes: guest.notes,
      },
    });
    finalGuestId = createdGuest.id;
  } else {
    const g = await prisma.resortGuest.findUnique({ where: { id: finalGuestId } });
    if (!g) throw ApiError.notFound('Guest not found');
  }

  // Overlap check (block conflicts for active reservations)
  const conflicting = await prisma.resortReservation.findFirst({
    where: {
      roomId,
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      AND: [
        { checkInDate: { lt: checkOut } },
        { checkOutDate: { gt: checkIn } },
      ],
    },
  });

  if (conflicting) {
    throw ApiError.badRequest('Room is already reserved for the selected dates');
  }

  const reservation = await prisma.resortReservation.create({
    data: {
      roomId,
      guestId: finalGuestId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children,
      status,
      totalCents,
      notes,
    },
    include: { room: true, guest: true },
  });

  sendSuccess(res, reservation, 'Reservation created', 201);
});

/**
 * @desc    Update reservation status
 * @route   PATCH /api/v1/resort/reservations/:id/status
 * @access  Private/Admin
 */
export const updateResortReservationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) throw ApiError.badRequest('status is required');

  const existing = await prisma.resortReservation.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Reservation not found');

  const reservation = await prisma.resortReservation.update({
    where: { id },
    data: { status },
    include: { room: true, guest: true },
  });

  sendSuccess(res, reservation, 'Reservation updated');
});

