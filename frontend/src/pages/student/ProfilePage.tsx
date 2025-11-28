import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Edit, Lock } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '@store/index';
import { setUser } from '@store/slices/authSlice';
import { userService } from '@services/user.service';

interface ProfileFormData {
  fullName: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      country: user?.country || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        phone: user.phone || '',
        country: user.country || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(data);
      dispatch(setUser(updatedUser));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully. Please login again.');
      resetPassword();
      setPasswordDialogOpen(false);
      // User will be logged out by backend
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user?.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="body2" color="primary.main">
                {user?.role}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Credits:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.credits}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Level:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.currentLevel || 'Not Set'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                  <Button startIcon={<Edit />} onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitProfile(onSubmitProfile)}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      disabled={!isEditing}
                      {...registerProfile('fullName', {
                        required: 'Full name is required',
                      })}
                      error={!!profileErrors.fullName}
                      helperText={profileErrors.fullName?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      disabled={!isEditing}
                      {...registerProfile('phone')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      disabled={!isEditing}
                      {...registerProfile('country')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                      {...registerProfile('dateOfBirth')}
                    />
                  </Grid>
                </Grid>
              </form>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Security
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              margin="normal"
              {...registerPassword('currentPassword', {
                required: 'Current password is required',
              })}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isChangingPassword}>
              {isChangingPassword ? <CircularProgress size={20} /> : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
