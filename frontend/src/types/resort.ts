export type ResortRoomType = 'STANDARD' | 'DELUXE' | 'SUITE';
export type ResortRoomStatus = 'AVAILABLE' | 'OUT_OF_SERVICE';
export type ResortReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface ResortRoom {
  id: string;
  roomNumber: string;
  name?: string | null;
  type: ResortRoomType;
  capacity: number;
  baseRateCents: number;
  status: ResortRoomStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResortGuest {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResortReservation {
  id: string;
  roomId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ResortReservationStatus;
  totalCents?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  room: ResortRoom;
  guest: ResortGuest;
}

export interface CreateResortRoomInput {
  roomNumber: string;
  name?: string;
  type: ResortRoomType;
  capacity: number;
  baseRateCents: number;
  status?: ResortRoomStatus;
  notes?: string;
}

export interface CreateResortGuestInput {
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CreateResortReservationInput {
  roomId: string;
  guestId?: string;
  guest?: CreateResortGuestInput;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  status?: ResortReservationStatus;
  totalCents?: number;
  notes?: string;
}

