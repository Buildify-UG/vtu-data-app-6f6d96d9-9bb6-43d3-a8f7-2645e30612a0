import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  phone_number: string;
  network: string;
  description: string;
  reference_code: string;
  created_at: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTransactions();
  }, [filter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-secondary bg-secondary/10';
      case 'pending':
        return 'text-yellow-600 bg-yellow-500/10';
      case 'failed':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'data':
        return '📊 Data';
      case 'airtime':
        return '📞 Airtime';
      case 'wallet_funding':
        return '💰 Wallet Funding';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Transactions</h1>
        <p className="text-muted-foreground mb-8">View all your transaction history</p>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'success', 'pending', 'failed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All Transactions' : status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 text-foreground font-semibold">Type</th>
                    <th className="text-left py-4 px-6 text-foreground font-semibold">Reference</th>
                    <th className="text-left py-4 px-6 text-foreground font-semibold">Details</th>
                    <th className="text-right py-4 px-6 text-foreground font-semibold">Amount</th>
                    <th className="text-center py-4 px-6 text-foreground font-semibold">Status</th>
                    <th className="text-right py-4 px-6 text-foreground font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border hover:bg-background/50 transition-colors">
                      <td className="py-4 px-6 text-foreground">{getTypeLabel(txn.type)}</td>
                      <td className="py-4 px-6 text-foreground font-mono text-sm">{txn.reference_code}</td>
                      <td className="py-4 px-6">
                        <div className="text-foreground">{txn.network || '-'}</div>
                        <div className="text-sm text-muted-foreground">{txn.phone_number || txn.description}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-foreground">
                        ₦{txn.amount.toLocaleString('en-NG')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-muted-foreground text-sm">
                        {formatDate(txn.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
