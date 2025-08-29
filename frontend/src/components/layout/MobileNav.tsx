import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
];

export function MobileNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40"
    >
      <div className="grid grid-cols-5 py-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  isActive && 'bg-blue-100 dark:bg-blue-900'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="mt-1 truncate max-w-full">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}