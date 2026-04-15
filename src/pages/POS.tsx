import React, { useState, useMemo, useRef } from 'react';
import { useStore, Product, InvoiceItem, Invoice } from '../store';
import { Search, Plus, Trash2, Printer, MessageSquare, CreditCard, Wallet, Banknote, Smartphone, Save, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const POS = () => {
  const { products, addInvoice, currentUser, settings } = useStore();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<'Library' | 'Uniform' | 'Advertising'>('Library');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Vodafone Cash' | 'InstaPay' | 'Transfer'>('Cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isReservation, setIsReservation] = useState(false);

  // Derived
  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
      p.category === selectedCategory && 
      (p.code.toLowerCase().includes(productSearch.toLowerCase()) || 
       p.name.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [products, selectedCategory, productSearch]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const remaining = useMemo(() => Math.max(0, total - paidAmount), [total, paidAmount]);

  // Actions
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellPrice,
        category: product.category,
        size: product.size,
        color: product.color
      }]);
    }
    setProductSearch('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Simple text PDF (In real world, you'd use a better layout or html2canvas)
    doc.setFontSize(22);
    doc.text(settings.companyName, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(settings.address, 105, 30, { align: 'center' });
    doc.text(settings.phone, 105, 35, { align: 'center' });
    
    doc.line(10, 45, 200, 45);
    
    doc.text(`فاتورة رقم: ${invoice.invoiceNumber}`, 190, 55, { align: 'right' });
    doc.text(`التاريخ: ${invoice.date}`, 190, 65, { align: 'right' });
    doc.text(`العميل: ${invoice.customerName}`, 190, 75, { align: 'right' });
    doc.text(`الهاتف: ${invoice.customerPhone}`, 190, 85, { align: 'right' });

    doc.line(10, 95, 200, 95);
    doc.text('المنتج', 190, 105, { align: 'right' });
    doc.text('الكمية', 140, 105, { align: 'right' });
    doc.text('السعر', 100, 105, { align: 'right' });
    doc.text('الاجمالي', 60, 105, { align: 'right' });
    doc.line(10, 110, 200, 110);

    let y = 120;
    invoice.items.forEach(item => {
      doc.text(item.productName, 190, y, { align: 'right' });
      doc.text(item.quantity.toString(), 140, y, { align: 'right' });
      doc.text(item.price.toString(), 100, y, { align: 'right' });
      doc.text((item.price * item.quantity).toString(), 60, y, { align: 'right' });
      y += 10;
    });

    doc.line(10, y + 5, 200, y + 5);
    doc.text(`الإجمالي: ${invoice.total} ج.م`, 60, y + 15, { align: 'right' });
    doc.text(`المدفوع: ${invoice.paid} ج.م`, 60, y + 25, { align: 'right' });
    doc.text(`المتبقي: ${invoice.remaining} ج.م`, 60, y + 35, { align: 'right' });

    doc.text('شكراً لتعاملكم معنا ❤️', 105, y + 55, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleSaveInvoice = () => {
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
        alert('برجاء إدخال بيانات العميل');
        return;
    }

    const prefix = selectedCategory === 'Library' ? 'LIB' : selectedCategory === 'Uniform' ? 'UNI' : 'ADV';
    const invoiceNumber = `INV-${prefix}-${Date.now().toString().slice(-4)}`;

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber,
      customerId: Math.random().toString(36).substr(2, 9),
      customerName,
      customerPhone: `+20${customerPhone}`,
      items: cart,
      total,
      paid: isReservation ? paidAmount : total,
      remaining: isReservation ? remaining : 0,
      paymentMethod,
      paymentRef: paymentMethod !== 'Cash' ? paymentRef : undefined,
      date: format(new Date(), 'yyyy-MM-dd HH:mm'),
      category: selectedCategory,
      type: isReservation ? 'Reservation' : 'Direct',
      status: (!isReservation || remaining === 0) ? 'Completed' : 'Pending',
      createdBy: currentUser?.username || 'System'
    };

    addInvoice(newInvoice);
    generatePDF(newInvoice);
    
    // Reset
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaidAmount(0);
    setPaymentRef('');
    setIsReservation(false);
    alert('تم حفظ الفاتورة بنجاح وتحميل ملف PDF');
  };

  const openWhatsApp = () => {
    if (!customerPhone || cart.length === 0) return;
    
    const message = `*فاتورة - ${selectedCategory === 'Library' ? 'مكتبة' : selectedCategory === 'Uniform' ? 'يونيفورم' : 'دعاية'}*

العميل: ${customerName}
رقم: +20${customerPhone}

المنتجات:
${cart.map(item => `- ${item.productName} ${item.size ? `| ${item.size}` : ''} × ${item.quantity} = ${item.price * item.quantity}`).join('\n')}

*الإجمالي: ${total}*
*المدفوع: ${isReservation ? paidAmount : total}*
*المتبقي: ${isReservation ? remaining : 0}*

شكراً لتعاملكم معنا ❤️`;

    const url = `https://wa.me/20${customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full text-right" dir="rtl">
      {/* Left side: Cart & Checkout */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl">
             {(['Library', 'Uniform', 'Advertising'] as const).map(cat => (
               <button
                 key={cat}
                 onClick={() => {
                     setSelectedCategory(cat);
                     setCart([]);
                 }}
                 className={`flex-1 py-3 rounded-lg font-bold transition-all ${selectedCategory === cat ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {cat === 'Library' ? 'مكتبة' : cat === 'Uniform' ? 'يونيفورم' : 'دعاية'}
               </button>
             ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
               <input
                 type="text"
                 value={customerName}
                 onChange={(e) => setCustomerName(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                 placeholder="اسم العميل الرباعي"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (+20)</label>
               <input
                 type="tel"
                 value={customerPhone}
                 onChange={(e) => setCustomerPhone(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                 placeholder="01xxxxxxxxx"
               />
             </div>
           </div>

           <div className="relative">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input
               type="text"
               value={productSearch}
               onChange={(e) => setProductSearch(e.target.value)}
               className="w-full pr-12 pl-4 py-4 bg-gray-900 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg"
               placeholder="ابحث عن منتج بالكود أو الاسم..."
             />
             
             {filteredProducts.length > 0 && (
               <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                 {filteredProducts.map(product => (
                   <button
                     key={product.id}
                     onClick={() => addToCart(product)}
                     className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                         {product.code.slice(-2)}
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-gray-900">{product.name}</p>
                         <p className="text-xs text-gray-500">{product.size} {product.color ? `| ${product.color}` : ''}</p>
                       </div>
                     </div>
                     <div className="text-left">
                       <p className="font-bold text-blue-600">{product.sellPrice} ج.م</p>
                       <p className={`text-[10px] ${product.quantity < 5 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>متاح: {product.quantity}</p>
                     </div>
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-bold text-gray-900">سلة المشتريات</h3>
             <span className="text-sm text-gray-500">{cart.length} منتجات</span>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
            {cart.map(item => (
              <div key={item.productId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                  <div>
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.size} {item.color ? `- ${item.color}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="px-3 py-1 hover:bg-gray-100 text-gray-500">-</button>
                    <span className="px-3 py-1 font-bold w-12 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-500">+</button>
                  </div>
                  <p className="w-24 text-left font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} ج.م</p>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                 السلة فارغة، ابدأ بإضافة منتجات
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Summary & Payment */}
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-lg mb-6 border-b pb-4">ملخص الدفع</h3>
           
           <div className="space-y-4 mb-8">
             <div className="flex justify-between items-center text-gray-600">
               <span>الإجمالي</span>
               <span className="font-bold text-gray-900 text-xl">{total.toLocaleString()} ج.م</span>
             </div>

             <div className="pt-4 border-t">
               <label className="flex items-center gap-2 mb-4 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={isReservation}
                   onChange={(e) => {
                       setIsReservation(e.target.checked);
                       if (!e.target.checked) setPaidAmount(total);
                   }}
                   className="w-5 h-5 rounded text-blue-600"
                 />
                 <span className="font-bold text-blue-600">حجز (دفع جزئي)</span>
               </label>

               {isReservation && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                   <div>
                     <label className="block text-sm text-gray-500 mb-1">المبلغ المدفوع</label>
                     <input
                       type="number"
                       value={paidAmount}
                       onChange={(e) => setPaidAmount(Number(e.target.value))}
                       className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-700"
                     />
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-500">المتبقي</span>
                     <span className="font-bold text-red-600">{remaining.toLocaleString()} ج.م</span>
                   </div>
                 </div>
               )}
             </div>
           </div>

           <div className="space-y-3 mb-8">
             <p className="text-sm font-medium text-gray-700">طريقة الدفع</p>
             <div className="grid grid-cols-2 gap-2">
               {[
                 { id: 'Cash', label: 'كاش', icon: Banknote },
                 { id: 'Vodafone Cash', label: 'فودافون', icon: Smartphone },
                 { id: 'InstaPay', label: 'إنستا باي', icon: Wallet },
                 { id: 'Transfer', label: 'تحويل', icon: CreditCard },
               ].map(method => (
                 <button
                   key={method.id}
                   onClick={() => setPaymentMethod(method.id as any)}
                   className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                   <method.icon size={16} />
                   <span className="text-xs font-bold">{method.label}</span>
                 </button>
               ))}
             </div>
             
             {paymentMethod !== 'Cash' && (
               <div className="animate-in slide-in-from-top-2 duration-200">
                 <input
                   type="text"
                   value={paymentRef}
                   onChange={(e) => setPaymentRef(e.target.value)}
                   placeholder="رقم العملية / رقم المرسل"
                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                 />
               </div>
             )}
           </div>

           <div className="flex flex-col gap-3">
             <button
               onClick={handleSaveInvoice}
               disabled={cart.length === 0}
               className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
             >
               <Save size={20} />
               تأكيد وحفظ (PDF)
             </button>
             
             <button
               onClick={openWhatsApp}
               disabled={cart.length === 0 || !customerPhone}
               className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors"
             >
               <MessageSquare size={18} />
               إرسال واتساب
             </button>
           </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
           <AlertCircle className="text-amber-600 shrink-0" size={20} />
           <p className="text-xs text-amber-800 leading-relaxed">
             عند الضغط على "تأكيد وحفظ"، سيتم خصم الكميات من المخزون تلقائياً وتوليد فاتورة بصيغة PDF.
           </p>
        </div>
      </div>
    </div>
  );
};
