import React, { useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, Receipt, Package, DollarSign, AlertTriangle, Library, Shirt, Palette } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, subValue }: { title: string, value: string | number, icon: any, color: string, subValue?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {subValue && <span className="text-xs text-gray-400">{subValue}</span>}
    </div>
  </div>
);

export const Dashboard = () => {
  const { invoices, products, currentUser } = useStore();

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayInvoices = invoices.filter(inv => inv.date.startsWith(today));
    
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const todayProfit = todayInvoices.reduce((sum, inv) => {
        // This is a simplified profit calc, in reality we'd need to look up cost at time of sale
        return sum + (inv.total * 0.2); // Placeholder: 20% margin if cost not stored per item in invoice
    }, 0);

    const lowStockCount = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
    const outOfStockCount = products.filter(p => p.quantity <= 0).length;

    return {
      todaySales,
      invoiceCount: todayInvoices.length,
      lowStockCount,
      outOfStockCount,
      totalProducts: products.length
    };
  }, [invoices, products]);

  const sectorStats = useMemo(() => {
    const categories: ('Library' | 'Uniform' | 'Advertising')[] = ['Library', 'Uniform', 'Advertising'];
    return categories.map(cat => {
        const catInvoices = invoices.filter(inv => inv.category === cat);
        const total = catInvoices.reduce((sum, inv) => sum + inv.total, 0);
        return { category: cat, total, count: catInvoices.length };
    });
  }, [invoices]);

  const categoryNames = {
    Library: 'المكتبة',
    Uniform: 'اليونيفورم',
    Advertising: 'الدعاية والإعلان'
  };

  const categoryIcons = {
    Library: Library,
    Uniform: Shirt,
    Advertising: Palette
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أهلاً بك، {currentUser?.username} 👋</h1>
          <p className="text-gray-500">إليك ملخص سريع لأداء اليوم</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="مبيعات اليوم" 
          value={`${stats.todaySales.toLocaleString()} ج.م`} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="عدد الفواتير" 
          value={stats.invoiceCount} 
          icon={Receipt} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="تنبيهات المخزون" 
          value={stats.lowStockCount} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
          subValue={`${stats.outOfStockCount} نفذت`}
        />
        <StatCard 
          title="إجمالي المنتجات" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sectorStats.map((stat) => {
          const Icon = categoryIcons[stat.category];
          return (
            <div key={stat.category} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-500">{categoryNames[stat.category]}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{stat.total.toLocaleString()} ج.م</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{stat.count} فاتورة</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">أحدث الفواتير</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">عرض الكل</button>
          </div>
          <div className="divide-y divide-gray-50">
            {invoices.slice(-5).reverse().map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {inv.invoiceNumber.split('-')[1]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{inv.customerName}</p>
                    <p className="text-xs text-gray-500">{inv.date}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{inv.total} ج.م</p>
                  <p className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${inv.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status === 'Completed' ? 'مكتمل' : 'حجز'}
                  </p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="p-12 text-center text-gray-400">لا توجد فواتير بعد</div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">تنبيهات المخزون</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {products.filter(p => p.quantity < 10).slice(0, 5).map((prod) => (
              <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${prod.quantity === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prod.name}</p>
                    <p className="text-xs text-gray-500">{categoryNames[prod.category]}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${prod.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>{prod.quantity} قطعة</p>
                  <p className="text-[10px] text-gray-400">كود: {prod.code}</p>
                </div>
              </div>
            ))}
             {products.filter(p => p.quantity < 10).length === 0 && (
              <div className="p-12 text-center text-gray-400">المخزون سليم حالياً</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
