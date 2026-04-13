import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Chip, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Pagination, Tooltip, Grid, InputAdornment, LinearProgress,
} from '@mui/material';
import { Add, Search, Edit, Delete, Email, Phone, FilterList } from '@mui/icons-material';
import { contactService, companyService, dashboardService } from '@services/crm.service';
import { Contact, Company, User, ContactStatus, ContactSource } from '@types/crm';
import toast from 'react-hot-toast';

const STATUS_COLOR: Record<ContactStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  LEAD: 'info', PROSPECT: 'default', QUALIFIED: 'warning', CLIENT: 'success', INACTIVE: 'error',
};
const STATUS_LABEL: Record<ContactStatus, string> = {
  LEAD: 'Lead', PROSPECT: 'Prospect', QUALIFIED: 'Qualified', CLIENT: 'Client', INACTIVE: 'Inactive',
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', jobTitle: '', status: 'LEAD' as ContactStatus, source: 'OTHER' as ContactSource, companyId: '', assignedToId: '', notes: '', tags: [] as string[] };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const limit = 15;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactService.getAll({ page, limit, search: search || undefined, status: statusFilter || undefined });
      setContacts(res.data);
      setTotal(res.pagination.total);
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => {
    companyService.getAll({ limit: 100 }).then(r => setCompanies(r.data));
    dashboardService.getTeam().then(setTeam);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (c: Contact) => { setEditing(c); setForm({ ...EMPTY_FORM, ...c, companyId: c.company?.id || '', assignedToId: c.assignedTo?.id || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await contactService.update(editing.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await contactService.create(form);
        toast.success('Tạo contact thành công');
      }
      setDialogOpen(false);
      fetchContacts();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa contact này?')) return;
    try { await contactService.delete(id); toast.success('Đã xóa'); fetchContacts(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Contacts</Typography>
          <Typography variant="body2" color="text.secondary">{total} contacts tổng cộng</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Thêm Contact</Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" placeholder="Tìm theo tên, email..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>Họ tên</TableCell><TableCell>Công ty</TableCell><TableCell>Trạng thái</TableCell>
              <TableCell>Nguồn</TableCell><TableCell>Liên hệ</TableCell><TableCell>Phụ trách</TableCell><TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>{c.firstName.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{c.firstName} {c.lastName}</Typography>
                      {c.jobTitle && <Typography variant="caption" color="text.secondary">{c.jobTitle}</Typography>}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2">{c.company?.name || '—'}</Typography></TableCell>
                <TableCell><Chip label={STATUS_LABEL[c.status]} color={STATUS_COLOR[c.status]} size="small" /></TableCell>
                <TableCell><Typography variant="caption">{c.source}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {c.email && <Tooltip title={c.email}><IconButton size="small" href={`mailto:${c.email}`}><Email fontSize="small" /></IconButton></Tooltip>}
                    {c.phone && <Tooltip title={c.phone}><IconButton size="small" href={`tel:${c.phone}`}><Phone fontSize="small" /></IconButton></Tooltip>}
                  </Box>
                </TableCell>
                <TableCell><Typography variant="caption">{c.assignedTo?.fullName || '—'}</Typography></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && contacts.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có contacts nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa Contact' : 'Thêm Contact mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField fullWidth label="Tên *" value={form.firstName} onChange={fc('firstName')} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Họ *" value={form.lastName} onChange={fc('lastName')} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={form.email} onChange={fc('email')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Số điện thoại" value={form.phone} onChange={fc('phone')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Chức danh" value={form.jobTitle} onChange={fc('jobTitle')} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Trạng thái</InputLabel>
                <Select label="Trạng thái" value={form.status} onChange={fc('status')}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Nguồn</InputLabel>
                <Select label="Nguồn" value={form.source} onChange={fc('source')}>
                  {['WEBSITE','REFERRAL','SOCIAL_MEDIA','EMAIL_CAMPAIGN','COLD_OUTREACH','EVENT','OTHER'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Công ty</InputLabel>
                <Select label="Công ty" value={form.companyId} onChange={fc('companyId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Phụ trách</InputLabel>
                <Select label="Phụ trách" value={form.assignedToId} onChange={fc('assignedToId')}>
                  <MenuItem value="">Tự động</MenuItem>
                  {team.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Ghi chú" multiline rows={3} value={form.notes} onChange={fc('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.firstName || !form.lastName}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
