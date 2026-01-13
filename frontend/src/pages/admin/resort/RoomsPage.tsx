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
import { resortService } from '@services/resort.service';
import { CreateResortRoomInput, ResortRoom, ResortRoomStatus, ResortRoomType } from '@appTypes/resort';

const RoomsPage = () => {
  const [rooms, setRooms] = useState<ResortRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<CreateResortRoomInput>({
    roomNumber: '',
    name: '',
    type: 'STANDARD',
    capacity: 2,
    baseRateCents: 0,
    status: 'AVAILABLE',
    notes: '',
  });

  const roomTypeOptions: ResortRoomType[] = useMemo(() => ['STANDARD', 'DELUXE', 'SUITE'], []);
  const roomStatusOptions: ResortRoomStatus[] = useMemo(() => ['AVAILABLE', 'OUT_OF_SERVICE'], []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await resortService.listRooms();
      setRooms(data);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await resortService.createRoom({
        ...form,
        capacity: Number(form.capacity),
        baseRateCents: Number(form.baseRateCents),
      });
      toast.success('Room created');
      setOpen(false);
      setForm({
        roomNumber: '',
        name: '',
        type: 'STANDARD',
        capacity: 2,
        baseRateCents: 0,
        status: 'AVAILABLE',
        notes: '',
      });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to create room');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resortService.deleteRoom(id);
      toast.success('Room deleted');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to delete room');
    }
  };

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Rooms</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Room
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Room #</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Base rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.roomNumber}</TableCell>
                <TableCell>{r.name || '-'}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>{formatMoney(r.baseRateCents)}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">
                  <Button color="error" size="small" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>{loading ? 'Loading...' : 'No rooms yet'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Room</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Room number"
            margin="dense"
            value={form.roomNumber}
            onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Name (optional)"
            margin="dense"
            value={form.name || ''}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ResortRoomType }))}
            >
              {roomTypeOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Capacity"
            margin="dense"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
          />
          <TextField
            fullWidth
            label="Base rate (cents)"
            margin="dense"
            type="number"
            value={form.baseRateCents}
            onChange={(e) => setForm((p) => ({ ...p, baseRateCents: Number(e.target.value) }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.status || 'AVAILABLE'}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ResortRoomStatus }))}
            >
              {roomStatusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPage;

