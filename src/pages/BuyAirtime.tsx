import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Wallet {
  balance: number;
}

export default function BuyAirtime() {
  const { user } = useAuth();
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const fetchWallet = async () => {
    try {
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!network || !phoneNumber || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (!wallet || wallet.balance < amountNum) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setProcessing(true);
    try {
      // Create transaction
      const { data: txnData, error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'airtime',
          status: 'pending',
          network,
          phone_number: phoneNumber,
          amount: amountNum,
          description: `₦${amountNum.toLocaleString('en-NG')} airtime`,
          reference_code: `AIRTIME-${Date.now()}`,
        })
        .select()
        .single();

      if (txnError) throw txnError;

      // Deduct from wallet
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amountNum })
        .eq('user_id', user?.id);

      // Update transaction status to success
      await supabase
        .from('transactions')
        .update({ status: 'success' })
        .eq('id', txnData.id);

      toast.success(`₦${amountNum.toLocaleString('en-NG')} airtime sent to ${phoneNumber}`);
      
      // Reset form
      setNetwork('');
      setPhoneNumber('');
      setAmount('');
      fetchWallet();
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Buy Airtime</h1>
        <p className="text-muted-foreground mb-8">Send airtime to any phone number</p>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Network Selection */}
              <div className="bg-card rounded-lg border border-border p-6">
                <Label className="text-foreground font-semibold mb-4 block">Select Network</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {networks.map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net)}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        network === net
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number */}
              <div className="bg-card rounded-lg border border-border p-6">
                <Label htmlFor="phone" className="text-foreground font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">Enter the phone number to send airtime to</p>
              </div>

              {/* Amount Selection */}
              <div className="bg-card rounded-lg border border-border p-6">
                <Label className="text-foreground font-semibold mb-4 block">Select Amount</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all text-sm ${
                        amount === quickAmount.toString()
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-border text-foreground hover:border-secondary/50'
                      }`}
                    >
                      ₦{quickAmount.toLocaleString('en-NG')}
                    </button>
                  ))}
                </div>

                <Label htmlFor="customAmount" className="text-foreground font-semibold text-sm">
                  Or enter custom amount
                </Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="Enter amount in ₦"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2"
                  min="50"
                  max="50000"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  {network && (
                    <div>
                      <p className="text-muted-foreground text-sm">Network</p>
                      <p className="font-semibold text-foreground">{network}</p>
                    </div>
                  )}

                  {phoneNumber && (
                    <div>
                      <p className="text-muted-foreground text-sm">Phone Number</p>
                      <p className="font-semibold text-foreground">{phoneNumber}</p>
                    </div>
                  )}

                  {amount && (
                    <div>
                      <p className="text-muted-foreground text-sm">Amount</p>
                      <p className="font-semibold text-foreground">₦{parseFloat(amount).toLocaleString('en-NG')}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Wallet Balance</span>
                    <span className="font-semibold text-foreground">₦{wallet?.balance?.toLocaleString('en-NG') || '0.00'}</span>
                  </div>
                  {amount && (
                    <>
                      <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold text-foreground">₦{parseFloat(amount).toLocaleString('en-NG')}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-border">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-secondary">₦{parseFloat(amount).toLocaleString('en-NG')}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={!network || !phoneNumber || !amount || processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Buy Airtime'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
