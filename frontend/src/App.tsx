import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

// Pages (to be created)
import HomePage from '@pages/public/HomePage';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import DashboardPage from '@pages/student/DashboardPage';

// Layout components (to be created)
import PublicLayout from '@components/layouts/PublicLayout';
import AuthLayout from '@components/layouts/AuthLayout';
import StudentLayout from '@components/layouts/StudentLayout';
import PrivateRoute from '@components/common/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Student Routes - Protected */}
          <Route
            element={
              <PrivateRoute>
                <StudentLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* More student routes will be added here */}
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
