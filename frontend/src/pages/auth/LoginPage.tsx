import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, InputAdornment, IconButton,
  Alert, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, TrendingUp } from '@mui/icons-material';
import { useAppDispatch } from '@store/index';
import { setCredentials } from '@store/slices/authSlice';
import axiosInstance from '@utils/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(`Chào mừng, ${user.fullName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f5f5f5' }}>
      {/* Left Panel */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, bgcolor: '#1a1a2e', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6 }}>
        <Box sx={{ textAlign: 'center', color: 'white', maxWidth: 400 }}>
          <Box sx={{ width: 72, height: 72, bgcolor: 'primary.main', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <TrendingUp sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h3" fontWeight={800} mb={2}>LIMONCG CRM</Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.7)" mb={4}>
            Nền tảng quản lý khách hàng toàn diện cho marketing agency
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {[{ n: '500+', l: 'Contacts' }, { n: '200+', l: 'Deals' }, { n: '50+', l: 'Projects' }].map(({ n, l }) => (
              <Box key={l} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="primary.light">{n}</Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">{l}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel - Login Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Đăng nhập</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Vui lòng nhập thông tin tài khoản của bạn</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
              autoComplete="email" autoFocus
            />
            <TextField
              fullWidth label="Mật khẩu" value={password}
              type={showPass ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )}}
            />
            <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{' '}
              <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Đăng ký ngay</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
