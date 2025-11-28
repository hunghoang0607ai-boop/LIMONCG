import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { useAppSelector } from '@store/index';

const AuthLayout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
