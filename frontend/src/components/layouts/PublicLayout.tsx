import { Outlet } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            LIMONCG
          </Typography>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
          <Button color="inherit" component={RouterLink} to="/register">
            Register
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 LIMONCG - English Exam Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicLayout;
