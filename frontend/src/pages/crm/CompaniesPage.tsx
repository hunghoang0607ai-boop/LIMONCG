import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Pagination, Grid, InputAdornment, LinearProgress, Avatar,
} from '@mui/material';
import { Add, Search, Edit, Delete, Business, OpenInNew } from '@mui/icons-material';
import { companyService } from '@services/crm.service';
import { Company, CompanySize } from '@types/crm';
import toast from 'react-hot-toast';

const SIZE_LABELS: Record<CompanySize, string> = { STARTUP: '1-10', SMALL: '11-50', MEDIUM: '51-200', LARGE: '201-1000', ENTERPRISE: '1000+' };

const EMPTY = { name: '', industry: '', website: '', phone: '', email: '', address: '', city: '', country: 'Vietnam', size: '' as CompanySize | '', revenue: '', notes: '' };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const limit = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await companyService.getAll({ page, limit, search: search || undefined });
      setCompanies(r.data); setTotal(r.pagination.total);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Company) => { setEditing(c); setForm({ ...EMPTY, ...c, size: c.size || '', revenue: c.revenue?.toString() || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      const data = { ...form, revenue: form.revenue ? parseFloat(form.revenue) : undefined, size: form.size || undefined };
      if (editing) { await companyService.update(editing.id, data); toast.success('Cập nhật thành công'); }
      else { await companyService.create(data); toast.success('Tạo công ty thành công'); }
      setDialogOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa công ty này?')) return;
    try { await companyService.delete(id); toast.success('Đã xóa'); fetch(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Công ty</Typography>
          <Typography variant="body2" color="text.secondary">{total} công ty</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Thêm Công ty</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <TextField fullWidth size="small" placeholder="Tìm công ty..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell>Công ty</TableCell><TableCell>Ngành</TableCell><TableCell>Quy mô</TableCell>
            <TableCell>Contacts</TableCell><TableCell>Deals</TableCell><TableCell>Website</TableCell><TableCell align="right">Thao tác</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.light' }}><Business fontSize="small" /></Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      {c.city && <Typography variant="caption" color="text.secondary">{c.city}, {c.country}</Typography>}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2">{c.industry || '—'}</Typography></TableCell>
                <TableCell>{c.size ? <Chip label={SIZE_LABELS[c.size]} size="small" variant="outlined" /> : '—'}</TableCell>
                <TableCell><Chip label={c._count?.contacts || 0} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell><Chip label={c._count?.deals || 0} size="small" color="success" variant="outlined" /></TableCell>
                <TableCell>
                  {c.website ? <IconButton size="small" href={c.website} target="_blank"><OpenInNew fontSize="small" /></IconButton> : '—'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && companies.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có công ty nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > limit && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, v) => setPage(v)} color="primary" /></Box>}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa Công ty' : 'Thêm Công ty mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Tên công ty *" value={form.name} onChange={fc('name')} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Ngành" value={form.industry} onChange={fc('industry')} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Quy mô</InputLabel>
                <Select label="Quy mô" value={form.size} onChange={fc('size')}>
                  <MenuItem value="">Không rõ</MenuItem>
                  {Object.entries(SIZE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v} nhân viên</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Website" value={form.website} onChange={fc('website')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={fc('email')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Điện thoại" value={form.phone} onChange={fc('phone')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Thành phố" value={form.city} onChange={fc('city')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Quốc gia" value={form.country} onChange={fc('country')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Doanh thu (VND)" type="number" value={form.revenue} onChange={fc('revenue')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Ghi chú" multiline rows={2} value={form.notes} onChange={fc('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
