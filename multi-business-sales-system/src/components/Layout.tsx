import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Users, BarChart3, Settings, Bell, LogOut, Menu, X, QrCode } from 'lucide-react';
import { useStore } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active 
        ? "bg-blue-600 text-white" 
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout = () => {
  const { currentUser, setCurrentUser, settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم', roles: ['Admin', 'Sales'] },
    { to: '/inventory', icon: Package, label: 'المخزون', roles: ['Admin'] },
    { to: '/pos', icon: Receipt, label: 'إنشاء فاتورة', roles: ['Admin', 'Sales'] },
    { to: '/invoices', icon: Receipt, label: 'إدارة الفواتير', roles: ['Admin', 'Sales'] },
    { to: '/customers', icon: Users, label: 'العملاء', roles: ['Admin'] },
    { to: '/reports', icon: BarChart3, label: 'التقارير', roles: ['Admin'] },
    { to: '/qr-generator', icon: QrCode, label: 'مولد QR', roles: ['Admin'] },
    { to: '/settings', icon: Settings, label: 'الإعدادات', roles: ['Admin'] },
  ].filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "bg-gray-900 text-white w-64 transition-all duration-300 fixed inset-y-0 right-0 z-50 flex flex-col",
        !isSidebarOpen && "translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {settings.logo ? (
                 <img src={settings.logo} alt="Logo" className="w-8 h-8 rounded" />
             ) : (
                 <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm">M</div>
             )}
            <h1 className="text-xl font-bold truncate">{settings.companyName}</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.username}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.role === 'Admin' ? 'مدير النظام' : 'مبيعات'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "mr-64" : "mr-0"
      )}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-sm">
                <span className="text-gray-500">التاريخ: </span>
                <span className="font-medium">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        </header>

        <div className="p-6 overflow-auto h-[calc(100vh-64px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
