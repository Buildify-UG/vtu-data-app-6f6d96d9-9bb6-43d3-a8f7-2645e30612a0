import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Smartphone, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">ABM Data Plug</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-1">
            <Link to="/home">
              <Button variant={isActive('/home') ? 'default' : 'ghost'}>Home</Button>
            </Link>
            <Link to="/buy-data">
              <Button variant={isActive('/buy-data') ? 'default' : 'ghost'}>Buy Data</Button>
            </Link>
            <Link to="/buy-airtime">
              <Button variant={isActive('/buy-airtime') ? 'default' : 'ghost'}>Buy Airtime</Button>
            </Link>
            <Link to="/wallet">
              <Button variant={isActive('/wallet') ? 'default' : 'ghost'}>Wallet</Button>
            </Link>
            <Link to="/transactions">
              <Button variant={isActive('/transactions') ? 'default' : 'ghost'}>Transactions</Button>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Link to="/profile">
              <Button variant="outline" size="sm">
                {user?.email?.split('@')[0]}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-1 mt-4 overflow-x-auto pb-2">
          <Link to="/home" className="flex-shrink-0">
            <Button variant={isActive('/home') ? 'default' : 'ghost'} size="sm">Home</Button>
          </Link>
          <Link to="/buy-data" className="flex-shrink-0">
            <Button variant={isActive('/buy-data') ? 'default' : 'ghost'} size="sm">Data</Button>
          </Link>
          <Link to="/buy-airtime" className="flex-shrink-0">
            <Button variant={isActive('/buy-airtime') ? 'default' : 'ghost'} size="sm">Airtime</Button>
          </Link>
          <Link to="/wallet" className="flex-shrink-0">
            <Button variant={isActive('/wallet') ? 'default' : 'ghost'} size="sm">Wallet</Button>
          </Link>
          <Link to="/transactions" className="flex-shrink-0">
            <Button variant={isActive('/transactions') ? 'default' : 'ghost'} size="sm">Txn</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
