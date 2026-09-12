import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DataBundle {
  id: string;
  network: string;
  size: string;
  price: number;
  validity_days: number;
}

interface Wallet {
  balance: number;
}

export default function BuyData() {
  const { user } = useAuth();
  const [network, setNetwork] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bundles, setBundles] = useState<DataBundle[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch bundles
      const { data: bundlesData } = await supabase
        .from('data_bundles')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (bundlesData) {
        setBundles(bundlesData);
      }

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBundles = network ? bundles.filter((b) => b.network === network) : [];

  const handlePurchase = async () => {
    if (!selectedBundle || !phoneNumber || !network) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!wallet || wallet.balance < selectedBundle.price) {
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
          type: 'data',
          status: 'pending',
          network,
          phone_number: phoneNumber,
          amount: selectedBundle.price,
          description: `${selectedBundle.size} data bundle`,
          reference_code: `DATA-${Date.now()}`,
        })
        .select()
        .single();

      if (txnError) throw txnError;

      // Deduct from wallet
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance - selectedBundle.price })
        .eq('user_id', user?.id);

      // Update transaction status to success (in production, integrate with VTU API)
      await supabase
        .from('transactions')
        .update({ status: 'success' })
        .eq('id', txnData.id);

      toast.success(`₦${selectedBundle.price.toLocaleString('en-NG')} deducted. Data will arrive shortly!`);
      
      // Reset form
      setNetwork('');
      setSelectedBundle(null);
      setPhoneNumber('');
      fetchData();
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Buy Data</h1>
        <p className="text-muted-foreground mb-8">Select your network and data bundle</p>

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
                      onClick={() => {
                        setNetwork(net);
                        setSelectedBundle(null);
                      }}
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

              {/* Bundle Selection */}
              {network && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <Label className="text-foreground font-semibold mb-4 block">Select Bundle</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBundles.map((bundle) => (
                      <button
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedBundle?.id === bundle.id
                            ? 'border-secondary bg-secondary/10'
                            : 'border-border hover:border-secondary/50'
                        }`}
                      >
                        <div className="font-semibold text-foreground">{bundle.size}</div>
                        <div className="text-sm text-muted-foreground">{bundle.validity_days} days validity</div>
                        <div className="text-lg font-bold text-secondary mt-2">₦{bundle.price.toLocaleString('en-NG')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Phone Number */}
              {selectedBundle && (
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
                  <p className="text-sm text-muted-foreground mt-2">Enter the phone number to send data to</p>
                </div>
              )}
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

                  {selectedBundle && (
                    <>
                      <div>
                        <p className="text-muted-foreground text-sm">Bundle</p>
                        <p className="font-semibold text-foreground">{selectedBundle.size}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Validity</p>
                        <p className="font-semibold text-foreground">{selectedBundle.validity_days} days</p>
                      </div>
                    </>
                  )}

                  {phoneNumber && (
                    <div>
                      <p className="text-muted-foreground text-sm">Phone Number</p>
                      <p className="font-semibold text-foreground">{phoneNumber}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Wallet Balance</span>
                    <span className="font-semibold text-foreground">₦{wallet?.balance?.toLocaleString('en-NG') || '0.00'}</span>
                  </div>
                  {selectedBundle && (
                    <>
                      <div className="flex justify-between mb-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold text-foreground">₦{selectedBundle.price.toLocaleString('en-NG')}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-border">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-secondary">₦{selectedBundle.price.toLocaleString('en-NG')}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={!selectedBundle || !phoneNumber || processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Buy Data'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
