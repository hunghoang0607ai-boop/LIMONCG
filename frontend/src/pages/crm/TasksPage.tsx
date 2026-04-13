import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Pagination, Grid, InputAdornment, LinearProgress, Checkbox, Tooltip,
} from '@mui/material';
import { Add, Search, Edit, Delete, CheckCircle, RadioButtonUnchecked, Warning } from '@mui/icons-material';
import { taskService, contactService, dealService, projectService, dashboardService } from '@services/crm.service';
import { Task, TaskStatus, TaskPriority, Contact, Deal, Project, User } from '@types/crm';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const PRIORITY_COLOR: Record<TaskPriority, 'default' | 'info' | 'warning' | 'error'> = { LOW: 'default', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error' };
const PRIORITY_LABEL: Record<TaskPriority, string> = { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', URGENT: 'Khẩn cấp' };
const STATUS_LABEL: Record<TaskStatus, string> = { TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', DONE: 'Xong', CANCELLED: 'Đã hủy' };
const EMPTY = { title: '', description: '', priority: 'MEDIUM' as TaskPriority, status: 'TODO' as TaskStatus, dueDate: '', assignedToId: '', contactId: '', dealId: '', projectId: '' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const limit = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await taskService.getAll({ page, limit, status: statusFilter || undefined, priority: priorityFilter || undefined, search: search || undefined });
      setTasks(r.data); setTotal(r.pagination.total);
    } finally { setLoading(false); }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    contactService.getAll({ limit: 100 }).then(r => setContacts(r.data));
    dealService.getAll({ limit: 100 }).then(r => setDeals(r.data));
    projectService.getAll({ limit: 100 }).then(r => setProjects(r.data));
    dashboardService.getTeam().then(setTeam);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ ...EMPTY, ...t, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '', assignedToId: t.assignedTo?.id || '', contactId: t.contact?.id || '', dealId: t.deal?.id || '', projectId: t.project?.id || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined };
      if (editing) { await taskService.update(editing.id, data); toast.success('Cập nhật thành công'); }
      else { await taskService.create(data); toast.success('Tạo task thành công'); }
      setDialogOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa task?')) return;
    try { await taskService.delete(id); toast.success('Đã xóa'); fetch(); }
    catch (e: any) { toast.error('Có lỗi xảy ra'); }
  };

  const toggleDone = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try { await taskService.update(task.id, { status: newStatus }); fetch(); }
    catch (e) { toast.error('Có lỗi xảy ra'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tasks</Typography>
          <Typography variant="body2" color="text.secondary">{total} tasks tổng cộng</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Thêm Task</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" placeholder="Tìm task..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small"><InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small"><InputLabel>Ưu tiên</InputLabel>
              <Select label="Ưu tiên" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(PRIORITY_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell width={40}></TableCell>
            <TableCell>Công việc</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell>
            <TableCell>Hạn chót</TableCell><TableCell>Phụ trách</TableCell><TableCell>Liên kết</TableCell><TableCell align="right">Thao tác</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {tasks.map((t) => {
              const overdue = t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'DONE';
              return (
                <TableRow key={t.id} hover sx={{ opacity: t.status === 'DONE' ? 0.6 : 1 }}>
                  <TableCell padding="checkbox">
                    <Checkbox icon={<RadioButtonUnchecked />} checkedIcon={<CheckCircle />} checked={t.status === 'DONE'} onChange={() => toggleDone(t)} color="success" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500} sx={{ textDecoration: t.status === 'DONE' ? 'line-through' : 'none' }}>{t.title}</Typography>
                    {t.description && <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>{t.description}</Typography>}
                  </TableCell>
                  <TableCell><Chip label={PRIORITY_LABEL[t.priority]} color={PRIORITY_COLOR[t.priority]} size="small" /></TableCell>
                  <TableCell><Chip label={STATUS_LABEL[t.status]} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    {t.dueDate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {overdue && <Tooltip title="Quá hạn"><Warning color="error" fontSize="small" /></Tooltip>}
                        <Typography variant="body2" color={overdue ? 'error.main' : 'text.primary'}>{format(new Date(t.dueDate), 'dd/MM/yyyy')}</Typography>
                      </Box>
                    ) : '—'}
                  </TableCell>
                  <TableCell><Typography variant="caption">{t.assignedTo?.fullName || '—'}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {t.project ? `📁 ${t.project.name}` : t.deal ? `💼 ${t.deal.title}` : t.contact ? `👤 ${t.contact.firstName}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(t)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && tasks.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Chưa có task nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > limit && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, v) => setPage(v)} color="primary" /></Box>}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa Task' : 'Thêm Task mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Tiêu đề *" value={form.title} onChange={fc('title')} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mô tả" multiline rows={2} value={form.description} onChange={fc('description')} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Ưu tiên</InputLabel>
                <Select label="Ưu tiên" value={form.priority} onChange={fc('priority')}>
                  {Object.entries(PRIORITY_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Trạng thái</InputLabel>
                <Select label="Trạng thái" value={form.status} onChange={fc('status')}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Hạn chót" type="date" value={form.dueDate} onChange={fc('dueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Phụ trách</InputLabel>
                <Select label="Phụ trách" value={form.assignedToId} onChange={fc('assignedToId')}>
                  <MenuItem value="">Tự động</MenuItem>
                  {team.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Liên kết với Project</InputLabel>
                <Select label="Liên kết với Project" value={form.projectId} onChange={fc('projectId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Liên kết với Deal</InputLabel>
                <Select label="Liên kết với Deal" value={form.dealId} onChange={fc('dealId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {deals.map(d => <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
