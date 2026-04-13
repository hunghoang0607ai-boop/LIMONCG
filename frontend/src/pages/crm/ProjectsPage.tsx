import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Grid, Card, CardContent, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, LinearProgress, Paper, InputAdornment,
} from '@mui/material';
import { Add, Search, Edit, Delete, CalendarToday, AttachMoney, FolderOpen } from '@mui/icons-material';
import { projectService, companyService, dashboardService } from '@services/crm.service';
import { Project, ProjectStatus, Company, User } from '@types/crm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS: Record<ProjectStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' | 'secondary' }> = {
  PLANNING: { label: 'Lên kế hoạch', color: 'info' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'warning' },
  ON_HOLD: { label: 'Tạm dừng', color: 'secondary' },
  COMPLETED: { label: 'Hoàn thành', color: 'success' },
  CANCELLED: { label: 'Đã hủy', color: 'error' },
};

const EMPTY = { name: '', description: '', status: 'PLANNING' as ProjectStatus, budget: '', spent: '0', companyId: '', managerId: '', startDate: '', endDate: '', tags: '' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [team, setTeam] = useState<User[]>([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await projectService.getAll({ search: search || undefined, status: statusFilter || undefined, limit: 50 });
      setProjects(r.data); setTotal(r.pagination.total);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    companyService.getAll({ limit: 100 }).then(r => setCompanies(r.data));
    dashboardService.getTeam().then(setTeam);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, budget: p.budget?.toString() || '', spent: p.spent?.toString() || '0', companyId: p.company?.id || '', managerId: p.manager?.id || '', startDate: p.startDate ? p.startDate.split('T')[0] : '', endDate: p.endDate ? p.endDate.split('T')[0] : '', tags: p.tags.join(', ') });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, budget: form.budget ? parseFloat(form.budget) : undefined, spent: parseFloat(form.spent) || 0, startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined, endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editing) { await projectService.update(editing.id, data); toast.success('Cập nhật thành công'); }
      else { await projectService.create(data); toast.success('Tạo project thành công'); }
      setDialogOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa project này?')) return;
    try { await projectService.delete(id); toast.success('Đã xóa'); fetch(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Projects</Typography>
          <Typography variant="body2" color="text.secondary">{total} projects</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Tạo Project</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', gap: 2 }}>
        <TextField size="small" placeholder="Tìm project..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {Object.entries(STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        {projects.map((p) => {
          const budgetPercent = p.budget && p.spent ? Math.min((p.spent / p.budget) * 100, 100) : 0;
          return (
            <Grid item xs={12} md={6} lg={4} key={p.id}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { boxShadow: 2 }, transition: 'box-shadow 0.2s', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FolderOpen color="primary" />
                      <Typography variant="subtitle2" fontWeight={700}>{p.name}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                  <Chip label={STATUS[p.status].label} color={STATUS[p.status].color} size="small" sx={{ mb: 1 }} />
                  {p.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</Typography>}
                  {p.company && <Typography variant="caption" color="text.secondary" display="block">{p.company.name}</Typography>}
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 2 }}>
                    {p.startDate && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption">{format(new Date(p.startDate), 'dd/MM/yy')}</Typography>
                    </Box>}
                    {p.budget && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption">{Number(p.budget).toLocaleString('vi-VN')} ₫</Typography>
                    </Box>}
                  </Box>
                  {p.budget && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Ngân sách</Typography>
                        <Typography variant="caption" fontWeight={600}>{budgetPercent.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={budgetPercent} color={budgetPercent > 90 ? 'error' : budgetPercent > 70 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">PM: {p.manager?.fullName || '—'}</Typography>
                    <Chip label={`${p._count?.tasks || 0} tasks`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {!loading && projects.length === 0 && (
          <Grid item xs={12}><Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}><FolderOpen sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} /><Typography>Chưa có project nào</Typography></Box></Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa Project' : 'Tạo Project mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Tên project *" value={form.name} onChange={fc('name')} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Mô tả" multiline rows={2} value={form.description} onChange={fc('description')} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Trạng thái</InputLabel>
                <Select label="Trạng thái" value={form.status} onChange={fc('status')}>
                  {Object.entries(STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Ngân sách (VND)" type="number" value={form.budget} onChange={fc('budget')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Đã chi (VND)" type="number" value={form.spent} onChange={fc('spent')} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Ngày bắt đầu" type="date" value={form.startDate} onChange={fc('startDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Ngày kết thúc" type="date" value={form.endDate} onChange={fc('endDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Khách hàng</InputLabel>
                <Select label="Khách hàng" value={form.companyId} onChange={fc('companyId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Project Manager</InputLabel>
                <Select label="Project Manager" value={form.managerId} onChange={fc('managerId')}>
                  <MenuItem value="">Tự động</MenuItem>
                  {team.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Tags (phân cách bởi dấu phẩy)" value={form.tags} onChange={fc('tags')} /></Grid>
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
