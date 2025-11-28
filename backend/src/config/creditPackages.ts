export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  discount?: number; // Percentage discount
  popular?: boolean;
  badge?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    priceUSD: 9.99,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 25,
    priceUSD: 19.99,
    discount: 20,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 50,
    priceUSD: 34.99,
    discount: 30,
    popular: true,
    badge: 'Most Popular',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 100,
    priceUSD: 59.99,
    discount: 40,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    credits: 200,
    priceUSD: 99.99,
    discount: 50,
    badge: 'Best Value',
  },
];

/**
 * Get credit package by ID
 */
export const getCreditPackage = (id: string): CreditPackage | undefined => {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
};

/**
 * Calculate actual price with discount
 */
export const calculatePrice = (packageId: string): number => {
  const pkg = getCreditPackage(packageId);
  if (!pkg) return 0;

  if (pkg.discount) {
    return pkg.priceUSD * (1 - pkg.discount / 100);
  }

  return pkg.priceUSD;
};

/**
 * Validate package ID
 */
export const isValidPackage = (id: string): boolean => {
  return CREDIT_PACKAGES.some((pkg) => pkg.id === id);
};
