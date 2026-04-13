import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAppDispatch } from '@store/index';
import { setCredentials } from '@store/slices/authSlice';
import axiosInstance from '@utils/axios';
import toast from 'react-hot-toast';

const roles = [{ value: 'SALES', label: 'Sales' }, { value: 'MARKETER', label: 'Marketer' }, { value: 'MANAGER', label: 'Manager' }, { value: 'ADMIN', label: 'Admin' }];

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'SALES', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', form);
      const { user, accessToken, refreshToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success('Đăng ký thành công!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', p: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Tạo tài khoản</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Điền thông tin để bắt đầu sử dụng CRM</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Họ và tên" value={form.fullName} onChange={handleChange('fullName')} required autoFocus />
          <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
          <TextField fullWidth label="Mật khẩu" type="password" value={form.password} onChange={handleChange('password')} required inputProps={{ minLength: 8 }} />
          <FormControl fullWidth>
            <InputLabel>Vai trò</InputLabel>
            <Select label="Vai trò" value={form.role} onChange={handleChange('role')}>
              {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Phòng ban" value={form.department} onChange={handleChange('department')} />
          <TextField fullWidth label="Số điện thoại" value={form.phone} onChange={handleChange('phone')} />
          <Button fullWidth variant="contained" size="large" type="submit" disabled={loading} sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
