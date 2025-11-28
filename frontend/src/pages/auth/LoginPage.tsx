import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@store/index';
import { setCredentials } from '@store/slices/authSlice';
import axios from '@utils/axios';
import { LoginCredentials, AuthResponse } from '@types/index';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await axios.post<{ data: AuthResponse }>('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data.data;

      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome Back
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to continue to LIMONCG
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{ mt: 3, mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Sign up
          </Link>
        </Typography>
      </form>
    </Box>
  );
};

export default LoginPage;
