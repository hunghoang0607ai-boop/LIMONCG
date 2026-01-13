import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

// Pages
import HomePage from '@pages/public/HomePage';
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import VerifyEmailPage from '@pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@pages/auth/ResetPasswordPage';
import DashboardPage from '@pages/student/DashboardPage';
import ProfilePage from '@pages/student/ProfilePage';
import CreditPurchasePage from '@pages/student/CreditPurchasePage';
import CreditSuccessPage from '@pages/student/CreditSuccessPage';
import TransactionHistoryPage from '@pages/student/TransactionHistoryPage';
import { UserRole } from '@appTypes/index';

// Layout components (to be created)
import PublicLayout from '@components/layouts/PublicLayout';
import AuthLayout from '@components/layouts/AuthLayout';
import StudentLayout from '@components/layouts/StudentLayout';
import AdminLayout from '@components/layouts/AdminLayout';
import PrivateRoute from '@components/common/PrivateRoute';

// Resort admin pages
import ResortDashboardPage from '@pages/admin/resort/ResortDashboardPage';
import RoomsPage from '@pages/admin/resort/RoomsPage';
import GuestsPage from '@pages/admin/resort/GuestsPage';
import ReservationsPage from '@pages/admin/resort/ReservationsPage';

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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Public Auth Routes (no layout) */}
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Student Routes - Protected */}
          <Route
            element={
              <PrivateRoute>
                <StudentLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/credits/purchase" element={<CreditPurchasePage />} />
            <Route path="/credits/success" element={<CreditSuccessPage />} />
            <Route path="/credits/history" element={<TransactionHistoryPage />} />
            {/* More student routes will be added here */}
          </Route>

          {/* Admin Routes - Protected */}
          <Route
            element={
              <PrivateRoute roles={[UserRole.ADMIN]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/admin/resort" element={<ResortDashboardPage />} />
            <Route path="/admin/resort/rooms" element={<RoomsPage />} />
            <Route path="/admin/resort/guests" element={<GuestsPage />} />
            <Route path="/admin/resort/reservations" element={<ReservationsPage />} />
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
