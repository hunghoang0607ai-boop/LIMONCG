import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '@services/auth.service';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
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
          {!isSubmitted ? (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Email sx={{ fontSize: 60, color: 'primary.main' }} />
                <Typography variant="h4" gutterBottom>
                  Forgot Password?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email and we'll send you a link to reset your password
                </Typography>
              </Box>

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

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                </Button>

                <Typography variant="body2" align="center">
                  <Link component={RouterLink} to="/login">
                    Back to Login
                  </Link>
                </Typography>
              </form>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We've sent a password reset link to your email address. Please check your inbox
                and follow the instructions.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Didn't receive the email? Check your spam folder or{' '}
                <Link onClick={() => setIsSubmitted(false)} sx={{ cursor: 'pointer' }}>
                  try again
                </Link>
                .
              </Typography>
              <Button variant="outlined" component={RouterLink} to="/login" sx={{ mt: 2 }}>
                Back to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
