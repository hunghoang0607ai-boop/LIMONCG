import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { resortService } from '@services/resort.service';
import {
  CreateResortReservationInput,
  ResortReservation,
  ResortReservationStatus,
  ResortRoom,
} from '@appTypes/resort';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<ResortReservation[]>([]);
  const [rooms, setRooms] = useState<ResortRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const statusOptions: ResortReservationStatus[] = useMemo(
    () => ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
    []
  );

  const [form, setForm] = useState<CreateResortReservationInput>({
    roomId: '',
    guest: { fullName: '', email: '', phone: '' },
    checkInDate: format(new Date(), 'yyyy-MM-dd'),
    checkOutDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    adults: 1,
    children: 0,
    status: 'CONFIRMED',
    totalCents: 0,
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [resList, roomList] = await Promise.all([
        resortService.listReservations(),
        resortService.listRooms(),
      ]);
      setReservations(resList);
      setRooms(roomList);
      if (!form.roomId && roomList.length > 0) {
        setForm((p) => ({ ...p, roomId: roomList[0].id }));
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      if (!form.roomId) throw new Error('Please select a room');
      if (!form.guest?.fullName) throw new Error('Guest name is required');

      await resortService.createReservation({
        roomId: form.roomId,
        guest: {
          fullName: form.guest.fullName,
          email: form.guest.email || undefined,
          phone: form.guest.phone || undefined,
        },
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        adults: Number(form.adults || 1),
        children: Number(form.children || 0),
        status: form.status,
        totalCents: form.totalCents ? Number(form.totalCents) : undefined,
        notes: form.notes || undefined,
      });

      toast.success('Reservation created');
      setOpen(false);
      setForm((p) => ({
        ...p,
        guest: { fullName: '', email: '', phone: '' },
        notes: '',
      }));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to create reservation');
    }
  };

  const handleStatusChange = async (id: string, status: ResortReservationStatus) => {
    try {
      await resortService.updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update status');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), 'yyyy-MM-dd');
    } catch {
      return iso;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Reservations</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Create Reservation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Room</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.room?.roomNumber || '-'}</TableCell>
                <TableCell>{r.guest?.fullName || '-'}</TableCell>
                <TableCell>{formatDate(r.checkInDate)}</TableCell>
                <TableCell>{formatDate(r.checkOutDate)}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r.id, e.target.value as ResortReservationStatus)
                      }
                    >
                      {statusOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {r.adults}A / {r.children}C
                </TableCell>
                <TableCell>{r.totalCents != null ? `$${(r.totalCents / 100).toFixed(2)}` : '-'}</TableCell>
              </TableRow>
            ))}
            {reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>{loading ? 'Loading...' : 'No reservations yet'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reservation</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Room</InputLabel>
            <Select
              label="Room"
              value={form.roomId}
              onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.roomNumber} — {room.type} ({room.status})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Guest full name"
            margin="dense"
            value={form.guest?.fullName || ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, guest: { ...(p.guest || { fullName: '' }), fullName: e.target.value } }))
            }
          />
          <TextField
            fullWidth
            label="Guest email (optional)"
            margin="dense"
            value={form.guest?.email || ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, guest: { ...(p.guest || { fullName: '' }), email: e.target.value } }))
            }
          />
          <TextField
            fullWidth
            label="Guest phone (optional)"
            margin="dense"
            value={form.guest?.phone || ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, guest: { ...(p.guest || { fullName: '' }), phone: e.target.value } }))
            }
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Check-in"
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.checkInDate}
              onChange={(e) => setForm((p) => ({ ...p, checkInDate: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Check-out"
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.checkOutDate}
              onChange={(e) => setForm((p) => ({ ...p, checkOutDate: e.target.value }))}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Adults"
              margin="dense"
              type="number"
              value={form.adults || 1}
              onChange={(e) => setForm((p) => ({ ...p, adults: Number(e.target.value) }))}
            />
            <TextField
              fullWidth
              label="Children"
              margin="dense"
              type="number"
              value={form.children || 0}
              onChange={(e) => setForm((p) => ({ ...p, children: Number(e.target.value) }))}
            />
          </Box>

          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.status || 'CONFIRMED'}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value as ResortReservationStatus }))
              }
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Total (cents, optional)"
            margin="dense"
            type="number"
            value={form.totalCents || 0}
            onChange={(e) => setForm((p) => ({ ...p, totalCents: Number(e.target.value) }))}
          />
          <TextField
            fullWidth
            label="Notes (optional)"
            margin="dense"
            multiline
            minRows={2}
            value={form.notes || ''}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationsPage;

