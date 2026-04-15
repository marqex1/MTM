import React, { useState, useMemo } from 'react';
import { useStore, Invoice } from '../store';
import { Search, Filter, Eye, Trash2, Printer, MessageSquare, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const Invoices = () => {
  const { invoices, deleteInvoice } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.includes(searchTerm)
    ).reverse();
  }, [invoices, searchTerm]);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟ لن يتم استرجاع المخزون تلقائياً.')) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
          <p className="text-gray-500">عرض وتعديل وطباعة الفواتير السابقة</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة، اسم العميل أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
            <tr>
              <th className="px-6 py-4">رقم الفاتورة</th>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4">القسم</th>
              <th className="px-6 py-4">الإجمالي</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">العمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                <td className="px-6 py-4">
                    <p className="font-bold">{inv.customerName}</p>
                    <p className="text-xs text-gray-400">{inv.customerPhone}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                    {inv.category === 'Library' ? 'مكتبة' : inv.category === 'Uniform' ? 'يونيفورم' : 'دعاية'}
                </td>
                <td className="px-6 py-4 font-bold">{inv.total} ج.م</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${inv.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status === 'Completed' ? 'مكتمل' : 'حجز/معلق'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">تفاصيل الفاتورة {selectedInvoice.invoiceNumber}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-gray-400 text-sm mb-1">بيانات العميل</h4>
                    <p className="font-bold">{selectedInvoice.customerName}</p>
                    <p className="text-sm">{selectedInvoice.customerPhone}</p>
                </div>
                <div className="text-left">
                    <h4 className="text-gray-400 text-sm mb-1">التاريخ والوقت</h4>
                    <p className="font-bold">{selectedInvoice.date}</p>
                    <p className="text-sm">بواسطة: {selectedInvoice.createdBy}</p>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden mb-6">
                <table className="w-full text-right text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">المنتج</th>
                            <th className="p-3 text-center">الكمية</th>
                            <th className="p-3 text-left">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {selectedInvoice.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-3">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-xs text-gray-400">{item.size} {item.color}</p>
                                </td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-left font-bold">{(item.price * item.quantity).toLocaleString()} ج.م</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-500">الإجمالي</span>
                    <span className="font-bold text-lg">{selectedInvoice.total} ج.م</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">المدفوع</span>
                    <span className="font-bold text-green-600">{selectedInvoice.paid} ج.م</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-500">المتبقي</span>
                    <span className="font-bold text-red-600">{selectedInvoice.remaining} ج.م</span>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                 <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <Printer size={18} />
                    طباعة
                 </button>
                 <button className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <MessageSquare size={18} />
                    واتساب
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
