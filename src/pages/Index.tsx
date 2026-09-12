import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, Wallet, BarChart3 } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ABM Data Plug</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Buy Data & Airtime <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ABM Data Plug - Your trusted platform for instant data and airtime purchases across all Nigerian networks. Fast, secure, and reliable.
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8">Get Started Now</Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
            <Zap className="w-10 h-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Instant Delivery</h3>
            <p className="text-muted-foreground">Get your data and airtime instantly to your phone number</p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
            <Smartphone className="w-10 h-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Networks</h3>
            <p className="text-muted-foreground">Support for MTN, Airtel, Glo, and 9mobile networks</p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
            <Wallet className="w-10 h-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Easy Wallet</h3>
            <p className="text-muted-foreground">Fund your wallet and track all transactions easily</p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
            <BarChart3 className="w-10 h-10 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Best Rates</h3>
            <p className="text-muted-foreground">Competitive pricing with transparent rates in ₦</p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-20 bg-card rounded-lg border border-border p-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Sample Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Data Bundles</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">500MB (7 days)</span>
                  <span className="font-semibold text-secondary">₦150</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">1GB (30 days)</span>
                  <span className="font-semibold text-secondary">₦300</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">2GB (30 days)</span>
                  <span className="font-semibold text-secondary">₦500</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">5GB (30 days)</span>
                  <span className="font-semibold text-secondary">₦1,000</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Airtime</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">₦100 Airtime</span>
                  <span className="font-semibold text-secondary">₦100</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">₦500 Airtime</span>
                  <span className="font-semibold text-secondary">₦500</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">₦1,000 Airtime</span>
                  <span className="font-semibold text-secondary">₦1,000</span>
                </div>
                <div className="flex justify-between p-3 bg-background rounded border border-border">
                  <span className="text-foreground">₦5,000 Airtime</span>
                  <span className="font-semibold text-secondary">₦5,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2024 ABM Data Plug. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
