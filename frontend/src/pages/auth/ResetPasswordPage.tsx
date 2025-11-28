import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '@services/auth.service';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockReset sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h4" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="New Password"
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

            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
