import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Avatar, IconButton, Menu, MenuItem, Divider,
  Tooltip, useTheme, useMediaQuery, Badge,
} from '@mui/material';
import {
  Dashboard, People, Business, TrendingUp, FolderOpen, CheckBox,
  EventNote, Menu as MenuIcon, ChevronLeft, AccountCircle, Logout,
  NotificationsOutlined, Settings,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@store/index';
import { logout } from '@store/slices/authSlice';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Contacts', icon: <People />, path: '/contacts' },
  { label: 'Công ty', icon: <Business />, path: '/companies' },
  { label: 'Pipeline', icon: <TrendingUp />, path: '/deals' },
  { label: 'Projects', icon: <FolderOpen />, path: '/projects' },
  { label: 'Tasks', icon: <CheckBox />, path: '/tasks' },
  { label: 'Activities', icon: <EventNote />, path: '/activities' },
];

export default function CRMLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          width: open && !isMobile ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: open && !isMobile ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
            LIMONCG CRM
          </Typography>
          <Tooltip title="Thông báo">
            <IconButton><Badge badgeContent={0} color="error"><NotificationsOutlined /></Badge></IconButton>
          </Tooltip>
          <Tooltip title={user?.fullName || 'Profile'}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>{user?.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); }}><Settings sx={{ mr: 1, fontSize: 18 }} /> Cài đặt</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><Logout sx={{ mr: 1, fontSize: 18 }} /> Đăng xuất</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1a1a2e',
            color: 'white',
            border: 'none',
          },
        }}
      >
        <Toolbar sx={{ bgcolor: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight={800} color="white">CG</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="white">Marketing CRM</Typography>
          </Box>
        </Toolbar>

        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List dense>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => { navigate(item.path); if (isMobile) setOpen(false); }}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? '#90caf9' : 'rgba(255,255,255,0.6)', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? 'white' : 'rgba(255,255,255,0.7)' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

          <Box sx={{ px: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={600} color="white" display="block">{user?.fullName}</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ fontSize: 11 }}>{user?.role}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
