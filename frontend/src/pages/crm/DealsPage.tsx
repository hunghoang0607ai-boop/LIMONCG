import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Card, CardContent, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Grid, LinearProgress, Menu,
  Paper, Tooltip,
} from '@mui/material';
import { Add, MoreVert, Edit, Delete, AttachMoney, Person, Business } from '@mui/icons-material';
import { dealService, contactService, companyService, dashboardService } from '@services/crm.service';
import { Deal, DealStage, Contact, Company, User } from '@types/crm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STAGES: { key: DealStage; label: string; color: string; bg: string }[] = [
  { key: 'PROSPECTING', label: 'Tìm kiếm', color: '#1976d2', bg: '#e3f2fd' },
  { key: 'QUALIFICATION', label: 'Đánh giá', color: '#388e3c', bg: '#e8f5e9' },
  { key: 'PROPOSAL', label: 'Đề xuất', color: '#f57c00', bg: '#fff3e0' },
  { key: 'NEGOTIATION', label: 'Đàm phán', color: '#7b1fa2', bg: '#f3e5f5' },
  { key: 'CLOSED_WON', label: 'Thành công', color: '#2e7d32', bg: '#c8e6c9' },
  { key: 'CLOSED_LOST', label: 'Thất bại', color: '#c62828', bg: '#ffcdd2' },
];

const EMPTY = { title: '', value: '', currency: 'VND', stage: 'PROSPECTING' as DealStage, probability: '10', contactId: '', companyId: '', assignedToId: '', notes: '', expectedCloseDate: '' };

function DealCard({ deal, onEdit, onDelete, onStageChange }: { deal: Deal; onEdit: () => void; onDelete: () => void; onStageChange: (stage: DealStage) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <Card elevation={0} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { boxShadow: 2 }, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1, mr: 1 }}>{deal.title}</Typography>
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ mt: -0.5 }}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <AttachMoney fontSize="small" color="success" />
          <Typography variant="body2" fontWeight={700} color="success.main">
            {Number(deal.value).toLocaleString('vi-VN')} {deal.currency}
          </Typography>
        </Box>
        {deal.contact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{deal.contact.firstName} {deal.contact.lastName}</Typography>
          </Box>
        )}
        {deal.company && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Business sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{deal.company.name}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Chip label={`${deal.probability}%`} size="small" color={deal.probability >= 70 ? 'success' : deal.probability >= 40 ? 'warning' : 'default'} />
          {deal.expectedCloseDate && <Typography variant="caption" color="text.secondary">{format(new Date(deal.expectedCloseDate), 'dd/MM/yy')}</Typography>}
        </Box>
      </CardContent>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onEdit(); setAnchor(null); }}><Edit fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa</MenuItem>
        {STAGES.map(s => <MenuItem key={s.key} onClick={() => { onStageChange(s.key); setAnchor(null); }} disabled={s.key === deal.stage}>{s.label}</MenuItem>)}
        <MenuItem onClick={() => { onDelete(); setAnchor(null); }} sx={{ color: 'error.main' }}><Delete fontSize="small" sx={{ mr: 1 }} /> Xóa</MenuItem>
      </Menu>
    </Card>
  );
}

export default function DealsPage() {
  const [kanban, setKanban] = useState<Record<string, Deal[]>>({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [team, setTeam] = useState<User[]>([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setKanban(await dealService.getKanban()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    contactService.getAll({ limit: 100 }).then(r => setContacts(r.data));
    companyService.getAll({ limit: 100 }).then(r => setCompanies(r.data));
    dashboardService.getTeam().then(setTeam);
  }, []);

  const totalValue = Object.values(kanban).flat().reduce((sum, d) => sum + Number(d.value), 0);
  const totalDeals = Object.values(kanban).flat().length;

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({ ...EMPTY, ...d, value: d.value.toString(), probability: d.probability.toString(), contactId: d.contact?.id || '', companyId: d.company?.id || '', assignedToId: d.assignedTo?.id || '', expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.split('T')[0] : '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0, expectedCloseDate: form.expectedCloseDate ? new Date(form.expectedCloseDate).toISOString() : undefined };
      if (editing) { await dealService.update(editing.id, data); toast.success('Cập nhật thành công'); }
      else { await dealService.create(data); toast.success('Tạo deal thành công'); }
      setDialogOpen(false); fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa deal này?')) return;
    try { await dealService.delete(id); toast.success('Đã xóa'); fetch(); }
    catch (e: any) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra'); }
  };

  const handleStageChange = async (id: string, stage: DealStage) => {
    const prob: Record<DealStage, number> = { PROSPECTING: 10, QUALIFICATION: 25, PROPOSAL: 50, NEGOTIATION: 75, CLOSED_WON: 100, CLOSED_LOST: 0 };
    try { await dealService.updateStage(id, stage, prob[stage]); fetch(); toast.success('Đã chuyển giai đoạn'); }
    catch (e: any) { toast.error('Có lỗi xảy ra'); }
  };

  const fc = (f: string) => (e: any) => setForm({ ...form, [f]: e.target.value });

  if (loading && Object.keys(kanban).length === 0) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Sales Pipeline</Typography>
          <Typography variant="body2" color="text.secondary">{totalDeals} deals • Tổng: {totalValue.toLocaleString('vi-VN')} ₫</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ borderRadius: 2 }}>Thêm Deal</Button>
      </Box>

      {/* Kanban Board */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
        {STAGES.map(({ key, label, color, bg }) => {
          const stageDeal = kanban[key] || [];
          const stageValue = stageDeal.reduce((s, d) => s + Number(d.value), 0);
          return (
            <Box key={key} sx={{ minWidth: 240, flex: '0 0 240px' }}>
              <Paper elevation={0} sx={{ p: 1.5, mb: 1.5, bgcolor: bg, border: `1px solid ${color}40`, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>{label}</Typography>
                  <Chip label={stageDeal.length} size="small" sx={{ bgcolor: color, color: 'white', height: 20, fontSize: 11 }} />
                </Box>
                <Typography variant="caption" sx={{ color }}>{stageValue.toLocaleString('vi-VN')} ₫</Typography>
              </Paper>
              <Box sx={{ minHeight: 100 }}>
                {stageDeal.map(deal => (
                  <DealCard key={deal.id} deal={deal} onEdit={() => openEdit(deal)} onDelete={() => handleDelete(deal.id)} onStageChange={(s) => handleStageChange(deal.id, s)} />
                ))}
                {stageDeal.length === 0 && (
                  <Box sx={{ p: 2, textAlign: 'center', color: 'text.disabled', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="caption">Không có deals</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editing ? 'Chỉnh sửa Deal' : 'Thêm Deal mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Tên deal *" value={form.title} onChange={fc('title')} required /></Grid>
            <Grid item xs={7}><TextField fullWidth label="Giá trị" type="number" value={form.value} onChange={fc('value')} /></Grid>
            <Grid item xs={5}>
              <FormControl fullWidth><InputLabel>Tiền tệ</InputLabel>
                <Select label="Tiền tệ" value={form.currency} onChange={fc('currency')}>
                  {['VND', 'USD', 'EUR'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Giai đoạn</InputLabel>
                <Select label="Giai đoạn" value={form.stage} onChange={fc('stage')}>
                  {STAGES.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Xác suất (%)" type="number" value={form.probability} onChange={fc('probability')} inputProps={{ min: 0, max: 100 }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Ngày dự kiến đóng" type="date" value={form.expectedCloseDate} onChange={fc('expectedCloseDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Contact</InputLabel>
                <Select label="Contact" value={form.contactId} onChange={fc('contactId')}>
                  <MenuItem value="">Không có</MenuItem>
                  {contacts.map(c => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
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
            <Grid item xs={12}><TextField fullWidth label="Ghi chú" multiline rows={2} value={form.notes} onChange={fc('notes')} /></Grid>
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
