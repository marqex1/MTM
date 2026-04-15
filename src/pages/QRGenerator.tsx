import React, { useState } from 'react';
import { useStore } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Search, Grid, List as ListIcon } from 'lucide-react';

export const QRGenerator = () => {
  const { products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مولد ملصقات QR</h1>
          <p className="text-gray-500">اختر المنتجات لتوليد ملصقات باركود قابلة للطباعة</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={handlePrint}
                disabled={selectedProducts.length === 0}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50 transition-colors"
            >
                <Printer size={20} />
                طباعة الملصقات
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          />
        </div>
        <button
          onClick={selectAll}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold"
        >
          {selectedProducts.length === filteredProducts.length ? 'إلغاء الكل' : 'تحديد الكل'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 print:hidden">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => toggleProduct(product.id)}
            className={`p-4 rounded-2xl border-2 transition-all text-center space-y-3 ${selectedProducts.includes(product.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          >
            <div className="bg-white p-2 rounded-lg inline-block border border-gray-100 mx-auto">
                <QRCodeSVG value={product.code} size={64} />
            </div>
            <div>
                <p className="font-bold text-xs truncate">{product.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{product.code}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Printable Area */}
      <div className="hidden print:block bg-white p-8">
        <div className="grid grid-cols-4 gap-4">
            {products.filter(p => selectedProducts.includes(p.id)).map(product => (
                <div key={product.id} className="border border-gray-300 p-4 text-center space-y-2 rounded">
                    <p className="text-sm font-bold mb-1 truncate">{product.name}</p>
                    <div className="flex justify-center">
                        <QRCodeSVG value={product.code} size={100} />
                    </div>
                    <p className="text-xs font-mono mt-1">{product.code}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
