import { Button } from '@/components/ui/button';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TopNav() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 px-2">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
