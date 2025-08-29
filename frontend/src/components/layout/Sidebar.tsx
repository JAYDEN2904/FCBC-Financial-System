import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  Bell, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  if (isMobile) {
    return (
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-xl lg:hidden"
      >
        <SidebarContent 
          collapsed={false} 
          onToggle={() => {}} 
          onLogout={handleLogout} 
          onClose={onClose}
          isMobile={true}
        />
      </motion.div>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col bg-background border-r"
    >
      <SidebarContent 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        onLogout={handleLogout}
      />
    </motion.aside>
  );
}

function SidebarContent({ 
  collapsed, 
  onToggle, 
  onLogout, 
  onClose, 
  isMobile = false 
}: { 
  collapsed: boolean; 
  onToggle: () => void; 
  onLogout: () => void; 
  onClose?: () => void;
  isMobile?: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YM</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm">Youth Ministry</h2>
                <p className="text-xs text-muted-foreground">Dues System</p>
              </div>
            )}
          </motion.div>
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1.5"
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
          )}

          {isMobile && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg'
                      : 'text-muted-foreground'
                  )
                }
                onClick={() => isMobile && onClose?.()}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <motion.span
                  initial={false}
                  animate={{ 
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto'
                  }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-5 w-5" />
          <motion.span
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
          >
            Logout
          </motion.span>
        </Button>
      </div>
    </>
  );
}