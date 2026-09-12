import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Zap, Send, TrendingUp, ArrowRight } from 'lucide-react';

interface Wallet {
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  phone_number: string;
  network: string;
  created_at: string;
}

export default function Home() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }

      // Fetch recent transactions
      const { data: txnData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (txnData) {
        setTransactions(txnData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return 'text-secondary';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Manage your data and airtime purchases</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-8 text-primary-foreground mb-8 shadow-lg">
          <p className="text-primary-foreground/80 mb-2">Wallet Balance</p>
          <h2 className="text-5xl font-bold mb-6">
            {loading ? 'Loading...' : `₦${wallet?.balance?.toLocaleString('en-NG') || '0.00'}`}
          </h2>
          <Link to="/wallet">
            <Button variant="secondary" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Fund Wallet
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to="/buy-data">
            <div className="bg-card rounded-lg border border-border p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Buy Data</h3>
              <p className="text-muted-foreground mb-4">Get instant data bundles for all networks</p>
              <div className="flex items-center text-secondary font-semibold">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link to="/buy-airtime">
            <div className="bg-card rounded-lg border border-border p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Buy Airtime</h3>
              <p className="text-muted-foreground mb-4">Recharge airtime instantly to any number</p>
              <div className="flex items-center text-primary font-semibold">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-lg border border-border p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground">Recent Transactions</h3>
            <Link to="/transactions">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-background rounded border border-border">
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {txn.type === 'data' ? `Data - ${txn.network}` : txn.type === 'airtime' ? `Airtime - ${txn.network}` : 'Wallet Funding'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {txn.phone_number} • {formatDate(txn.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">₦{txn.amount.toLocaleString('en-NG')}</div>
                    <div className={`text-sm font-semibold capitalize ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
