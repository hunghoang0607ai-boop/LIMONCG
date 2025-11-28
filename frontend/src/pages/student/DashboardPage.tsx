import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { School, TrendingUp, Assessment, Stars } from '@mui/icons-material';
import { useAppSelector } from '@store/index';

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    { label: 'Exams Taken', value: '0', icon: <School />, color: '#1976d2' },
    { label: 'Average Score', value: 'N/A', icon: <TrendingUp />, color: '#2e7d32' },
    { label: 'Total Credits', value: user?.credits || 0, icon: <Stars />, color: '#ed6c02' },
    { label: 'Current Level', value: user?.currentLevel || 'Not Set', icon: <Assessment />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your progress and continue your learning journey
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: stat.color, mr: 1 }}>{stat.icon}</Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
                <Typography variant="h4">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<School />}>
              Browse Exams
            </Button>
            <Button variant="outlined" startIcon={<Assessment />}>
              Take Placement Test
            </Button>
            <Button variant="outlined" startIcon={<Stars />}>
              Buy Credits
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No recent activity yet. Start taking exams to see your progress here!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
