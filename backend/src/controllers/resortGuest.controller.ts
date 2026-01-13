import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * @desc    List resort guests
 * @route   GET /api/v1/resort/guests
 * @access  Private/Admin
 */
export const listResortGuests = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const guests = await prisma.resortGuest.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });

  sendSuccess(res, guests);
});

/**
 * @desc    Create resort guest
 * @route   POST /api/v1/resort/guests
 * @access  Private/Admin
 */
export const createResortGuest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, email, phone, notes } = req.body;

  if (!fullName) throw ApiError.badRequest('fullName is required');

  const guest = await prisma.resortGuest.create({
    data: {
      fullName,
      email,
      phone,
      notes,
    },
  });

  sendSuccess(res, guest, 'Guest created', 201);
});

