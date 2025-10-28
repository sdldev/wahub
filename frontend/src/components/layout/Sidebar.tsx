import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BarChart3, Settings, Send, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'user', 'readonly'] },
  { icon: Radio, label: 'Sessions', path: '/dashboard/sessions', roles: ['admin', 'user'] },
  { icon: Send, label: 'Messages', path: '/dashboard/messages', roles: ['admin', 'user'] },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', roles: ['admin', 'user', 'readonly'] },
  { icon: Users, label: 'Users', path: '/dashboard/users', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['admin'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">WA Gateway</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter(item => user?.role && item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Logged in as</p>
          <p className="font-medium text-foreground">{user?.email || 'Unknown user'}</p>
        </div>
      </div>
    </div>
  );
}
