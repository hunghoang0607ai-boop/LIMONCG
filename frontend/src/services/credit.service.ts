import axios from '@utils/axios';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  discount?: number;
  popular?: boolean;
  badge?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: string;
  referenceId?: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  amountUSD: number;
  creditsPurchased: number;
  paymentMethod: string;
  paymentStatus: string;
  externalPaymentId?: string;
  metadata?: any;
  paidAt?: string;
  createdAt: string;
}

export const creditService = {
  /**
   * Get all available credit packages
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    const response = await axios.get('/credits/packages');
    return response.data.data;
  },

  /**
   * Get user's current credit balance
   */
  async getCreditBalance(): Promise<{ credits: number }> {
    const response = await axios.get('/credits/balance');
    return response.data.data;
  },

  /**
   * Get user's transaction history
   */
  async getTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: CreditTransaction[];
    pagination: any;
  }> {
    const response = await axios.get('/credits/transactions', {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Purchase credits - returns Stripe checkout URL
   */
  async purchaseCredits(packageId: string): Promise<{
    sessionId: string;
    url: string;
    package: CreditPackage;
  }> {
    const response = await axios.post('/credits/purchase', { packageId });
    return response.data.data;
  },

  /**
   * Verify payment after Stripe redirect
   */
  async verifyPayment(sessionId: string): Promise<{
    status: string;
    credits: number;
  }> {
    const response = await axios.get(`/credits/verify/${sessionId}`);
    return response.data.data;
  },

  /**
   * Deduct credits (used internally when unlocking exams)
   */
  async deductCredits(
    amount: number,
    examId: string,
    description?: string
  ): Promise<{
    credits: number;
    deducted: number;
  }> {
    const response = await axios.post('/credits/deduct', {
      amount,
      examId,
      description,
    });
    return response.data.data;
  },
};
