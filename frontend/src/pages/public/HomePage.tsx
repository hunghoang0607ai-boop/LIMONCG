import { Box, Typography, Button, Grid, Card, CardContent, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School, Assessment, TrendingUp } from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <School sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Multiple Exam Types',
      description: 'Practice IELTS, PTE, TOEIC, FLYER, MOVER and more',
    },
    {
      icon: <Assessment sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Detailed Results',
      description: 'Get comprehensive feedback and performance analytics',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Track Progress',
      description: 'Monitor your improvement with personalized learning paths',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container>
          <Typography variant="h2" align="center" gutterBottom>
            Master English Exams
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Your comprehensive platform for IELTS, PTE, TOEIC and more
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: 'white', color: 'primary.main' }}
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: 'white', color: 'white' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Why Choose LIMONCG?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Ready to start your journey?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Take a free placement test to assess your level
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/register')}>
            Start Free Test
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
