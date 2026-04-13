import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Paper, List, ListItem, Avatar, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Grid, LinearProgress, InputAdornment, Pagination,
} from '@mui/material';
import { Add, Search, Edit, Delete, Phone, Email, EventNote, VideoCall, StickyNote2, CheckCircle } from '@mui/icons-material';
import { activityService, contactService, dealService } from '@services/crm.service';
import { Activity, ActivityType, Contact, Deal } from '@types/crm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: JSX.Element; color: string }> = {
  CALL: { label: 'Cuộc gọi', icon: <Phone fontSize="small" />, color: '#1976d2' },
  EMAIL: { label: 'Email', icon: <Email fontSize="small" />, color: '#388e3c' },
  MEETING: { label: 'Cuộc họp', icon: <EventNote fontSize="small" />, color: '#7b1fa2' },
  DEMO: { label: 'Demo', icon: <VideoCall fontSize="small" />, color: '#f57c00' },
  NOTE: { label: 'Ghi chú', icon: <StickyNote2 fontSize="small" />, color: '#5d4037' },
  FOLLOW_UP: { label: 'Follow up', icon: <CheckCircle fontSize="small" />, color: '#00897b' },
};

const EMPTY = { type: 'CALL' as ActivityType, subject: '', description: '', scheduledAt: '', completedAt: '', duration: '', contactId: '', dealId: '' };

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const limit = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await activityService.getAll({ page, limit, type: typeFilter || undefined, search: search || undefined });
      setActivities(r.data); setTotal(r.pagination.total);
    } finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    contactService.getAll({ limit: 100 }).then(r => setContacts(r.data));
    dealService.getAll({ limit: 100 }).then(r => setDeals(r.data));
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (a: Activity) => {
    setEditing(a);
    setForm({ ...EMPTY, ...a, scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : '', completedAt: a.completedAt ? a.completedAt.slice(0, 16) : '', duration: a.duration?.toString() || '', contactId: a.contact?.id || '', dealId: a.deal?.id || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, duration: form.duration ? parseInt(form.duration) : undefined, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined, completedAt: form.completedAt ? new Date(form.completedAt).toISOString() : undefined };
      if (editing) { await activityService.update(editing.id, data); toast.success('Cập nhật thành công'); }
      else { await activityService.create(data); toast.success('Ghi nhật ký thành công'); }
      setDialogOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa?')) return;
    try { await activityService.delete(id); toast.success('Đã xóa'); fetch(); }
    catch (e) { toast.error('Có lỗi xảy ra'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Nhật ký hoạt động</Typography>
          <Typography variant="body2" color="text.secondary">{total} hoạt động đã ghi nhận</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Ghi hoạt động</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', gap: 2 }}>
        <TextField size="small" placeholder="Tìm hoạt động..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Loại</InputLabel>
          <Select label="Loại" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(ACTIVITY_CONFIG).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <List disablePadding>
          {activities.map((a, idx) => {
            const cfg = ACTIVITY_CONFIG[a.type];
            return (
              <ListItem key={a.id} divider={idx < activities.length - 1}
                sx={{ py: 2, px: 3, '&:hover': { bgcolor: 'action.hover' }, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: `${cfg.color}20`, color: cfg.color, mr: 2, mt: 0.5, width: 36, height: 36 }}>{cfg.icon}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={cfg.label} size="small" sx={{ bgcolor: `${cfg.color}15`, color: cfg.color, fontWeight: 600, fontSize: 11 }} />
                    <Typography variant="subtitle2" fontWeight={600}>{a.subject}</Typography>
                  </Box>
                  {a.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{a.description}</Typography>}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      {a.createdBy.fullName} • {format(new Date(a.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </Typography>
                    {a.contact && <Typography variant="caption" color="primary.main">👤 {a.contact.firstName} {a.contact.lastName}</Typography>}
                    {a.deal && <Typography variant="caption" color="success.main">💼 {a.deal.title}</Typography>}
                    {a.duration && <Typography variant="caption" color="text.secondary">⏱ {a.duration} phút</Typography>}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  <IconButton size="small" onClick={() => openEdit(a)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete fontSize="small" /></IconButton>
                </Box>
              </ListItem>
            );
          })}
          {!loading && activities.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <EventNote sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography>Chưa có hoạt động nào được ghi nhận</Typography>
            </Box>
          )}
        </List>
      </Paper>

      {total > limit && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, v) => setPage(v)} color="primary" /></Box>}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa hoạt động' : 'Ghi nhận hoạt động mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Loại *</InputLabel>
                <Select label="Loại *" value={form.type} onChange={fc('type')}>
                  {Object.entries(ACTIVITY_CONFIG).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Thời lượng (phút)" type="number" value={form.duration} onChange={fc('duration')} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Tiêu đề *" value={form.subject} onChange={fc('subject')} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mô tả chi tiết" multiline rows={3} value={form.description} onChange={fc('description')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Thời gian lên lịch" type="datetime-local" value={form.scheduledAt} onChange={fc('scheduledAt')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Thời gian hoàn thành" type="datetime-local" value={form.completedAt} onChange={fc('completedAt')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Contact liên quan</InputLabel>
                <Select label="Contact liên quan" value={form.contactId} onChange={fc('contactId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {contacts.map(c => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Deal liên quan</InputLabel>
                <Select label="Deal liên quan" value={form.dealId} onChange={fc('dealId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {deals.map(d => <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.type || !form.subject}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
