import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Container,
} from '@mui/material';
import { Stars, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { creditService, CreditPackage } from '@services/credit.service';
import { useAppSelector } from '@store/index';

const CreditPurchasePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await creditService.getCreditPackages();
      setPackages(data);
    } catch (error: any) {
      toast.error('Failed to load credit packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const { url } = await creditService.purchaseCredits(packageId);
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate purchase');
      setPurchasing(null);
    }
  };

  const calculateDiscountedPrice = (pkg: CreditPackage) => {
    if (!pkg.discount) return pkg.priceUSD;
    return pkg.priceUSD * (1 - pkg.discount / 100);
  };

  const calculateSavings = (pkg: CreditPackage) => {
    if (!pkg.discount) return 0;
    return pkg.priceUSD - calculateDiscountedPrice(pkg);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Stars sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Purchase Credits
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Choose a credit package to unlock premium exams and features
          </Typography>
          <Typography variant="h6" color="primary">
            Current Balance: {user?.credits || 0} credits
          </Typography>
        </Box>

        {/* Credit Packages */}
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: pkg.popular ? 2 : 1,
                  borderColor: pkg.popular ? 'primary.main' : 'divider',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {/* Badge */}
                {pkg.badge && (
                  <Chip
                    label={pkg.badge}
                    color={pkg.popular ? 'primary' : 'warning'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  {/* Package Name */}
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {pkg.name}
                  </Typography>

                  {/* Credits */}
                  <Box sx={{ my: 3 }}>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                      {pkg.credits}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Credits
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    {pkg.discount ? (
                      <>
                        <Typography
                          variant="h4"
                          color="text.primary"
                          fontWeight="bold"
                          gutterBottom
                        >
                          ${calculateDiscountedPrice(pkg).toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${pkg.priceUSD.toFixed(2)}
                        </Typography>
                        <Chip
                          label={`Save ${pkg.discount}% ($${calculateSavings(pkg).toFixed(2)})`}
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </>
                    ) : (
                      <Typography variant="h4" color="text.primary" fontWeight="bold">
                        ${pkg.priceUSD.toFixed(2)}
                      </Typography>
                    )}
                  </Box>

                  {/* Price per credit */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ${(calculateDiscountedPrice(pkg) / pkg.credits).toFixed(2)} per credit
                  </Typography>

                  {/* Features */}
                  <Box sx={{ mt: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
                      <Typography variant="body2">Never expires</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
                      <Typography variant="body2">All exam types</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
                      <Typography variant="body2">Instant access</Typography>
                    </Box>
                  </Box>

                  {/* Purchase Button */}
                  <Button
                    fullWidth
                    variant={pkg.popular ? 'contained' : 'outlined'}
                    size="large"
                    disabled={purchasing !== null}
                    onClick={() => handlePurchase(pkg.id)}
                    sx={{ mt: 'auto' }}
                  >
                    {purchasing === pkg.id ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Purchase Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Info Section */}
        <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            How Credits Work
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>1. Choose a Package:</strong> Select the credit package that suits
                your needs
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>2. Secure Payment:</strong> Complete payment via Stripe (all major
                cards accepted)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>3. Start Learning:</strong> Use credits to unlock premium exams and
                features
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default CreditPurchasePage;
