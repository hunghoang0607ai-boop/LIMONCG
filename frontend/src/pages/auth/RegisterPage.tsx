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
import axios from '@utils/axios';
import { RegisterData } from '@types/index';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      await axios.post('/auth/register', registerData);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Create Account
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Join LIMONCG and start your English learning journey
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          {...register('fullName', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />

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
          sx={{ mt: 3, mb: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      </form>
    </Box>
  );
};

export default RegisterPage;
