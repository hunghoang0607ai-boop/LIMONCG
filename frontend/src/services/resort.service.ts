import axios from '@utils/axios';
import { ApiResponse } from '@appTypes/index';
import {
  CreateResortGuestInput,
  CreateResortReservationInput,
  CreateResortRoomInput,
  ResortGuest,
  ResortReservation,
  ResortReservationStatus,
  ResortRoom,
} from '@appTypes/resort';

export const resortService = {
  async listRooms(): Promise<ResortRoom[]> {
    const res = await axios.get<ApiResponse<ResortRoom[]>>('/resort/rooms');
    return res.data.data || [];
  },

  async createRoom(input: CreateResortRoomInput): Promise<ResortRoom> {
    const res = await axios.post<ApiResponse<ResortRoom>>('/resort/rooms', input);
    if (!res.data.data) throw new Error('Invalid response');
    return res.data.data;
  },

  async updateRoom(id: string, input: Partial<CreateResortRoomInput>): Promise<ResortRoom> {
    const res = await axios.put<ApiResponse<ResortRoom>>(`/resort/rooms/${id}`, input);
    if (!res.data.data) throw new Error('Invalid response');
    return res.data.data;
  },

  async deleteRoom(id: string): Promise<void> {
    await axios.delete<ApiResponse<null>>(`/resort/rooms/${id}`);
  },

  async listGuests(): Promise<ResortGuest[]> {
    const res = await axios.get<ApiResponse<ResortGuest[]>>('/resort/guests');
    return res.data.data || [];
  },

  async createGuest(input: CreateResortGuestInput): Promise<ResortGuest> {
    const res = await axios.post<ApiResponse<ResortGuest>>('/resort/guests', input);
    if (!res.data.data) throw new Error('Invalid response');
    return res.data.data;
  },

  async listReservations(params?: { status?: string; from?: string; to?: string }): Promise<ResortReservation[]> {
    const res = await axios.get<ApiResponse<ResortReservation[]>>('/resort/reservations', { params });
    return res.data.data || [];
  },

  async createReservation(input: CreateResortReservationInput): Promise<ResortReservation> {
    const res = await axios.post<ApiResponse<ResortReservation>>('/resort/reservations', input);
    if (!res.data.data) throw new Error('Invalid response');
    return res.data.data;
  },

  async updateReservationStatus(id: string, status: ResortReservationStatus): Promise<ResortReservation> {
    const res = await axios.patch<ApiResponse<ResortReservation>>(`/resort/reservations/${id}/status`, { status });
    if (!res.data.data) throw new Error('Invalid response');
    return res.data.data;
  },
};

