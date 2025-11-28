import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper, Container } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { authService } from '@services/auth.service';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        toast.success('Email verified! You can now login.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [token]);

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
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Verifying your email...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Email Verified!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {message}
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Error sx={{ fontSize: 80, color: 'error.main' }} />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {message}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
                <Button variant="contained" onClick={() => navigate('/register')}>
                  Register Again
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
