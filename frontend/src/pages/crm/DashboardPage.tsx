import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Skeleton, Alert, LinearProgress,
} from '@mui/material';
import {
  People, TrendingUp, CheckCircle, FolderOpen, AttachMoney,
  Warning, Phone, Email, EventNote, VideoCall, StickyNote2,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardService } from '@services/crm.service';
import { DashboardStats } from '@types/crm';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#64b5f6', QUALIFICATION: '#81c784', PROPOSAL: '#ffb74d',
  NEGOTIATION: '#ff8a65', CLOSED_WON: '#4caf50', CLOSED_LOST: '#ef5350',
};
const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: 'Tìm kiếm', QUALIFICATION: 'Đánh giá', PROPOSAL: 'Đề xuất',
  NEGOTIATION: 'Đàm phán', CLOSED_WON: 'Thành công', CLOSED_LOST: 'Thất bại',
};
const STATUS_COLORS: Record<string, string> = {
  LEAD: '#64b5f6', PROSPECT: '#81c784', QUALIFIED: '#ffb74d', CLIENT: '#4caf50', INACTIVE: '#bdbdbd',
};
const ACTIVITY_ICONS: Record<string, JSX.Element> = {
  CALL: <Phone fontSize="small" />, EMAIL: <Email fontSize="small" />,
  MEETING: <EventNote fontSize="small" />, DEMO: <VideoCall fontSize="small" />,
  NOTE: <StickyNote2 fontSize="small" />, FOLLOW_UP: <CheckCircle fontSize="small" />,
};

function StatCard({ title, value, subtitle, icon, color, trend }: any) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" fontWeight={700}>{value}</Typography>
            {subtitle && <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>{subtitle}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 48, height: 48 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(() => setError('Không thể tải dữ liệu')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ p: 2 }}><LinearProgress /><Grid container spacing={3} sx={{ mt: 2 }}>{[...Array(4)].map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} /></Grid>)}</Grid></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const { overview } = stats;

  const dealStageData = stats.dealsByStage.map(d => ({
    name: STAGE_LABELS[d.stage] || d.stage,
    count: d.count,
    value: d.value,
    fill: STAGE_COLORS[d.stage] || '#90caf9',
  }));

  const contactStatusData = stats.contactsByStatus.map(c => ({
    name: c.status, value: c.count, fill: STATUS_COLORS[c.status] || '#90caf9',
  }));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Tổng quan hoạt động {format(new Date(), 'MMMM yyyy', { locale: vi })}
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tổng Contacts" value={overview.totalContacts.toLocaleString()}
            subtitle={`${overview.contactGrowth >= 0 ? '+' : ''}${overview.contactGrowth}% so với tháng trước`}
            icon={<People />} color="primary" trend={overview.contactGrowth} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pipeline Value" value={`${(overview.pipelineValue / 1000000).toFixed(1)}M ₫`}
            subtitle={`${overview.activePipelineDeals} deals đang mở`}
            icon={<TrendingUp />} color="warning" trend={1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Doanh thu tháng này" value={`${(overview.revenueThisMonth / 1000000).toFixed(1)}M ₫`}
            subtitle={`${overview.wonDealsThisMonth} deals thành công`}
            icon={<AttachMoney />} color="success" trend={1} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasks đang mở" value={overview.activeTasks}
            subtitle={overview.overdueTasks > 0 ? `${overview.overdueTasks} quá hạn!` : 'Không có quá hạn'}
            icon={<Warning />} color={overview.overdueTasks > 0 ? 'error' : 'info'} trend={-overview.overdueTasks} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Pipeline theo giai đoạn</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dealStageData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ₫`, 'Giá trị']} />
                  <Bar dataKey="count" name="Số deals" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Contacts theo trạng thái</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={contactStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {contactStatusData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities + Projects */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Hoạt động gần đây</Typography>
              <List dense disablePadding>
                {stats.recentActivities.slice(0, 8).map((act) => (
                  <ListItem key={act.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 14 }}>
                        {ACTIVITY_ICONS[act.type] || <EventNote fontSize="small" />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={act.subject}
                      secondary={`${(act as any).createdBy?.fullName || ''} • ${format(new Date(act.createdAt), 'dd/MM HH:mm')}`}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Chip label={act.type} size="small" sx={{ fontSize: 10, height: 20 }} />
                  </ListItem>
                ))}
                {stats.recentActivities.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Chưa có hoạt động</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Tasks theo trạng thái</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.tasksByStatus.map(({ status, count }) => {
                  const colors: Record<string, string> = { TODO: '#64b5f6', IN_PROGRESS: '#ffb74d', DONE: '#4caf50', CANCELLED: '#bdbdbd' };
                  const labels: Record<string, string> = { TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', DONE: 'Xong', CANCELLED: 'Đã hủy' };
                  const total = stats.tasksByStatus.reduce((a, t) => a + t.count, 0);
                  return (
                    <Box key={status}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{labels[status] || status}</Typography>
                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={total > 0 ? (count / total) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: colors[status] || '#90caf9', borderRadius: 4 } }} />
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} color="primary.dark">Projects đang hoạt động</Typography>
                <Typography variant="h4" fontWeight={800} color="primary.dark">{overview.activeProjects}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
