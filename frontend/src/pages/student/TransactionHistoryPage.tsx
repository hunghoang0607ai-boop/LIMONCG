import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  School,
  CardGiftcard,
  Undo,
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { creditService, CreditTransaction } from '@services/credit.service';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [page]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await creditService.getTransactions(page, 10);
      setTransactions(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ShoppingCart sx={{ color: 'success.main' }} />;
      case 'EXAM_UNLOCK':
        return <School sx={{ color: 'primary.main' }} />;
      case 'BONUS':
        return <CardGiftcard sx={{ color: 'warning.main' }} />;
      case 'REFUND':
        return <Undo sx={{ color: 'error.main' }} />;
      default:
        return <TrendingUp sx={{ color: 'info.main' }} />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'success' : 'error';
  };

  const formatTransactionType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View all your credit transactions
      </Typography>

      {transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No transactions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your transaction history will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance After</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTransactionIcon(transaction.transactionType)}
                        <Chip
                          label={formatTransactionType(transaction.transactionType)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {transaction.amount > 0 ? (
                          <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={getTransactionColor(transaction.amount)}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.balanceAfter}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TransactionHistoryPage;
