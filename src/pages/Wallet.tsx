import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface Wallet {
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  created_at: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }

      const { data: txnData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (txnData) {
        setTransactions(txnData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = async () => {
    if (!fundAmount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setProcessing(true);
    try {
      // Create wallet funding transaction
      const { error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'wallet_funding',
          status: 'pending',
          amount: amount,
          description: 'Wallet funding',
          reference_code: `FUND-${Date.now()}`,
        });

      if (txnError) throw txnError;

      // In production, integrate with payment gateway (Flutterwave, Paystack, etc.)
      // For now, simulate successful funding
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update wallet balance
      await supabase
        .from('wallets')
        .update({ balance: (wallet?.balance || 0) + amount })
        .eq('user_id', user?.id);

      // Update transaction to success
      await supabase
        .from('transactions')
        .update({ status: 'success' })
        .eq('reference_code', `FUND-${Date.now()}`);

      toast.success(`₦${amount.toLocaleString('en-NG')} added to wallet`);
      setFundAmount('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to fund wallet');
    } finally {
      setProcessing(false);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Wallet</h1>
        <p className="text-muted-foreground mb-8">Manage your wallet balance</p>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Wallet Balance */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-8 text-primary-foreground shadow-lg">
                <p className="text-primary-foreground/80 mb-2">Wallet Balance</p>
                <h2 className="text-5xl font-bold mb-6">₦{wallet?.balance?.toLocaleString('en-NG') || '0.00'}</h2>
              </div>

              {/* Fund Wallet Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">Fund Wallet</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fundAmount" className="text-foreground font-semibold">
                      Amount to Fund (₦)
                    </Label>
                    <Input
                      id="fundAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="mt-2"
                      min="100"
                      max="500000"
                    />
                  </div>

                  <Button
                    onClick={handleFundWallet}
                    disabled={!fundAmount || processing}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {processing ? 'Processing...' : 'Fund Wallet'}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    💡 In production, this will redirect to payment gateway (Flutterwave, Paystack, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Fund Buttons */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Fund</h3>
                <div className="space-y-2">
                  {[1000, 2500, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setFundAmount(amount.toString())}
                      className="w-full p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all text-foreground font-semibold"
                    >
                      ₦{amount.toLocaleString('en-NG')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="mt-12 bg-card rounded-lg border border-border p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Transaction History</h3>

          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground capitalize">{txn.type}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">₦{txn.amount.toLocaleString('en-NG')}</td>
                      <td className={`py-3 px-4 font-semibold capitalize ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(txn.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
