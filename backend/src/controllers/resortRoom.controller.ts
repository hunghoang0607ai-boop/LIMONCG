import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * @desc    List resort rooms
 * @route   GET /api/v1/resort/rooms
 * @access  Private/Admin
 */
export const listResortRooms = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rooms = await prisma.resortRoom.findMany({
    orderBy: [{ roomNumber: 'asc' }],
  });

  sendSuccess(res, rooms);
});

/**
 * @desc    Create resort room
 * @route   POST /api/v1/resort/rooms
 * @access  Private/Admin
 */
export const createResortRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomNumber, name, type, capacity, baseRateCents, status, notes } = req.body;

  const room = await prisma.resortRoom.create({
    data: {
      roomNumber,
      name,
      type,
      capacity,
      baseRateCents,
      status,
      notes,
    },
  });

  sendSuccess(res, room, 'Room created', 201);
});

/**
 * @desc    Update resort room
 * @route   PUT /api/v1/resort/rooms/:id
 * @access  Private/Admin
 */
export const updateResortRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { roomNumber, name, type, capacity, baseRateCents, status, notes } = req.body;

  const existing = await prisma.resortRoom.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Room not found');

  const room = await prisma.resortRoom.update({
    where: { id },
    data: {
      roomNumber,
      name,
      type,
      capacity,
      baseRateCents,
      status,
      notes,
    },
  });

  sendSuccess(res, room, 'Room updated');
});

/**
 * @desc    Delete resort room (only if no reservations)
 * @route   DELETE /api/v1/resort/rooms/:id
 * @access  Private/Admin
 */
export const deleteResortRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const room = await prisma.resortRoom.findUnique({
    where: { id },
    include: { _count: { select: { reservations: true } } },
  });

  if (!room) throw ApiError.notFound('Room not found');
  if (room._count.reservations > 0) {
    throw ApiError.badRequest('Cannot delete a room with reservations. Consider setting it OUT_OF_SERVICE.');
  }

  await prisma.resortRoom.delete({ where: { id } });
  sendSuccess(res, null, 'Room deleted');
});

