import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <Sidebar 
        isMobile 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={() => setSidebarOpen(true)}
          title="Dashboard"
        />
        
        <main className="flex-1 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
      
      <Toaster />
    </div>
  );
}