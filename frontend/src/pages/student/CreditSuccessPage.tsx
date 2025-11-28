import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { creditService } from '@services/credit.service';
import { useAppDispatch } from '@store/index';
import { setUser } from '@store/slices/authSlice';
import { userService } from '@services/user.service';

const CreditSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      toast.error('Invalid payment session');
      return;
    }

    try {
      const result = await creditService.verifyPayment(sessionId);
      setCredits(result.credits);
      setStatus('success');
      toast.success('Credits added successfully!');

      // Refresh user data to update credits
      const updatedUser = await userService.getProfile();
      dispatch(setUser(updatedUser));
    } catch (error: any) {
      setStatus('error');
      toast.error('Payment verification failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
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
                Verifying your payment...
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                Payment Successful!
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                +{credits} Credits Added
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your credits have been added to your account. You can now use them to unlock
                premium exams.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outlined" onClick={() => navigate('/exams')}>
                  Browse Exams
                </Button>
              </Box>
            </>
          )}

          {status === 'error' && (
            <>
              <Error sx={{ fontSize: 80, color: 'error.main' }} />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Payment Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We couldn't verify your payment. Please contact support if you believe this
                is an error.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="contained" onClick={() => navigate('/credits/purchase')}>
                  Try Again
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CreditSuccessPage;
