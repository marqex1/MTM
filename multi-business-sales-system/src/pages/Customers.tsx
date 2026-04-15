import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, Users, Receipt, CreditCard, ChevronLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Customers = () => {
  const { customers, invoices } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, searchTerm]);

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter(inv => inv.customerPhone === selectedCustomer);
  }, [invoices, selectedCustomer]);

  const selectedCustomerData = customers.find(c => c.phone === selectedCustomer);

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-500">متابعة حسابات العملاء وتاريخ المشتريات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
           <div className="p-4 border-b">
             <div className="relative">
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                 type="text"
                 placeholder="بحث بالاسم أو الرقم..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
               />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
             {filteredCustomers.map(customer => (
               <button
                 key={customer.id}
                 onClick={() => setSelectedCustomer(customer.phone)}
                 className={`w-full p-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedCustomer === customer.phone ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
               >
                 <div>
                   <p className="font-bold text-gray-900">{customer.name}</p>
                   <p className="text-xs text-gray-500">{customer.phone}</p>
                 </div>
                 <div className="text-left">
                   <p className="font-bold text-blue-600">{customer.totalSpent.toLocaleString()} ج.م</p>
                   <p className="text-[10px] text-gray-400">{customer.orderCount} فواتير</p>
                 </div>
               </button>
             ))}
             {filteredCustomers.length === 0 && (
               <div className="p-12 text-center text-gray-400">
                 <Users size={48} className="mx-auto mb-4 opacity-20" />
                 <p>لا يوجد عملاء بعد</p>
               </div>
             )}
           </div>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomerData ? (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                     {selectedCustomerData.name[0]}
                   </div>
                   <div>
                     <h2 className="font-bold text-lg">{selectedCustomerData.name}</h2>
                     <p className="text-sm text-gray-500">{selectedCustomerData.phone}</p>
                   </div>
                 </div>
                 <div className="flex flex-col justify-center border-r pr-6">
                   <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
                   <p className="text-xl font-bold text-blue-600">{selectedCustomerData.totalSpent.toLocaleString()} ج.م</p>
                 </div>
                 <div className="flex flex-col justify-center border-r pr-6">
                   <p className="text-sm text-gray-500">عدد المعاملات</p>
                   <p className="text-xl font-bold text-gray-900">{selectedCustomerData.orderCount} عملية</p>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold">سجل الفواتير</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>آخر نشاط:</span>
                    <span>{selectedCustomerData.lastOrderDate}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-xs">
                      <tr>
                        <th className="px-6 py-3 font-bold">رقم الفاتورة</th>
                        <th className="px-6 py-3 font-bold">التاريخ</th>
                        <th className="px-6 py-3 font-bold">النوع</th>
                        <th className="px-6 py-3 font-bold">الإجمالي</th>
                        <th className="px-6 py-3 font-bold">الحالة</th>
                        <th className="px-6 py-3 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customerInvoices.map(inv => (
                        <tr key={inv.id} className="text-sm hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                          <td className="px-6 py-4">
                            {inv.type === 'Direct' ? 'بيع مباشر' : 'حجز'}
                          </td>
                          <td className="px-6 py-4 font-bold">{inv.total} ج.م</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${inv.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {inv.status === 'Completed' ? 'مكتمل' : 'معلق'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <ArrowUpRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-full">
               <Users size={64} className="text-gray-200 mb-4" />
               <p className="text-gray-400">اختر عميلاً من القائمة لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
