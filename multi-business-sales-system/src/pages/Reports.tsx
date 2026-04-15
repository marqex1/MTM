import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { BarChart3, TrendingUp, DollarSign, PieChart, Calendar, ChevronDown, Download, FileText, Library, Shirt, Palette } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export const Reports = () => {
  const { invoices, products } = useStore();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Library' | 'Uniform' | 'Advertising'>('All');

  const stats = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(2020, 0, 1);
        end = new Date(2099, 11, 31);
    }

    const filteredInvoices = invoices.filter(inv => {
      const invDate = parseISO(inv.date.split(' ')[0]);
      const inRange = dateRange === 'all' || isWithinInterval(invDate, { start, end });
      const inCategory = categoryFilter === 'All' || inv.category === categoryFilter;
      return inRange && inCategory;
    });

    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculate total cost (simplified lookup from products)
    const totalCost = filteredInvoices.reduce((sum, inv) => {
        return sum + inv.items.reduce((itemSum, item) => {
            const product = products.find(p => p.id === item.productId);
            return itemSum + ((product?.buyPrice || 0) * item.quantity);
        }, 0);
    }, 0);

    const netProfit = totalSales - totalCost;

    return {
      totalSales,
      totalCost,
      netProfit,
      count: filteredInvoices.length,
      avgInvoice: filteredInvoices.length > 0 ? totalSales / filteredInvoices.length : 0,
      invoices: filteredInvoices
    };
  }, [invoices, products, dateRange, categoryFilter]);

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير التحليلية</h1>
          <p className="text-gray-500">متابعة الأداء المالي وصافي الأرباح</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={18} />
                تصدير Excel
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="text-gray-400" size={18} />
            <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذه السنة</option>
                <option value="all">الكل</option>
            </select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {(['All', 'Library', 'Uniform', 'Advertising'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categoryFilter === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              {cat === 'All' ? 'الكل' : cat === 'Library' ? 'مكتبة' : cat === 'Uniform' ? 'يونيفورم' : 'دعاية'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">إجمالي المبيعات</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSales.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">تكلفة المشتريات</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCost.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">صافي الربح</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.netProfit.toLocaleString()} ج.م</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <PieChart size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">متوسط الفاتورة</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgInvoice.toLocaleString()} ج.م</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                تفاصيل العمليات في هذه الفترة
            </h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-6 py-4 font-bold">رقم الفاتورة</th>
              <th className="px-6 py-4 font-bold">التاريخ</th>
              <th className="px-6 py-4 font-bold">العميل</th>
              <th className="px-6 py-4 font-bold">القسم</th>
              <th className="px-6 py-4 font-bold">المبيعات</th>
              <th className="px-6 py-4 font-bold">الربح التقديري</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stats.invoices.map(inv => {
                const invCost = inv.items.reduce((itemSum, item) => {
                    const product = products.find(p => p.id === item.productId);
                    return itemSum + ((product?.buyPrice || 0) * item.quantity);
                }, 0);
                const invProfit = inv.total - invCost;

                return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                        <td className="px-6 py-4">{inv.customerName}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                {inv.category === 'Library' ? <Library size={14} /> : inv.category === 'Uniform' ? <Shirt size={14} /> : <Palette size={14} />}
                                <span>{inv.category === 'Library' ? 'مكتبة' : inv.category === 'Uniform' ? 'يونيفورم' : 'دعاية'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold">{inv.total} ج.م</td>
                        <td className="px-6 py-4 text-green-600 font-bold">{invProfit} ج.م</td>
                    </tr>
                );
            })}
            {stats.invoices.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">لا توجد مبيعات في هذه الفترة</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
