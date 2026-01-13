import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
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
import { CreateResortGuestInput, ResortGuest } from '@appTypes/resort';

const GuestsPage = () => {
  const [guests, setGuests] = useState<ResortGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateResortGuestInput>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await resortService.listGuests();
      setGuests(data);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await resortService.createGuest({
        fullName: form.fullName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Guest created');
      setOpen(false);
      setForm({ fullName: '', email: '', phone: '', notes: '' });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to create guest');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Guests</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Guest
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Full name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.fullName}</TableCell>
                <TableCell>{g.email || '-'}</TableCell>
                <TableCell>{g.phone || '-'}</TableCell>
                <TableCell>{g.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {guests.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>{loading ? 'Loading...' : 'No guests yet'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Guest</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Full name"
            margin="dense"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Email (optional)"
            margin="dense"
            value={form.email || ''}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Phone (optional)"
            margin="dense"
            value={form.phone || ''}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
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
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuestsPage;

