import React, { useState, useMemo } from 'react';
import { useStore, Product } from '../store';
import { Plus, Search, Filter, Edit2, Trash2, Package, Library, Shirt, Palette, ChevronDown, Download, Upload } from 'lucide-react';
import { clsx } from 'clsx';

export const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Library' | 'Uniform' | 'Advertising'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: 'Library',
    buyPrice: 0,
    sellPrice: 0,
    quantity: 0,
    size: '',
    color: '',
    school: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData } as Product);
    } else {
      addProduct({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        code: formData.code || `PROD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      } as Product);
    }
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({ name: '', code: '', category: 'Library', buyPrice: 0, sellPrice: 0, quantity: 0, size: '', color: '', school: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-500">إضافة وتعديل ومراقبة المنتجات في جميع الأقسام</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={18} />
                تصدير
            </button>
            <button
                onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: '', code: '', category: 'Library', buyPrice: 0, sellPrice: 0, quantity: 0, size: '', color: '', school: '' });
                    setShowAddModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
                <Plus size={20} />
                إضافة منتج
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {(['All', 'Library', 'Uniform', 'Advertising'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                categoryFilter === cat ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              {cat === 'All' ? 'الكل' : cat === 'Library' ? 'مكتبة' : cat === 'Uniform' ? 'يونيفورم' : 'دعاية'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-bold">المنتج</th>
              <th className="px-6 py-4 font-bold">الكود</th>
              <th className="px-6 py-4 font-bold">القسم</th>
              <th className="px-6 py-4 font-bold">الكمية</th>
              <th className="px-6 py-4 font-bold">سعر الشراء</th>
              <th className="px-6 py-4 font-bold">سعر البيع</th>
              <th className="px-6 py-4 font-bold">الحالة</th>
              <th className="px-6 py-4 font-bold">العمليات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                      {product.category === 'Library' ? <Library size={16} /> : product.category === 'Uniform' ? <Shirt size={16} /> : <Palette size={16} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      {product.category === 'Uniform' && (
                        <p className="text-xs text-gray-400">{product.size} | {product.color} | {product.school}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.code}</td>
                <td className="px-6 py-4">
                    <span className="text-sm">{product.category === 'Library' ? 'مكتبة' : product.category === 'Uniform' ? 'يونيفورم' : 'دعاية'}</span>
                </td>
                <td className="px-6 py-4 font-bold">{product.quantity}</td>
                <td className="px-6 py-4 text-sm">{product.buyPrice} ج.م</td>
                <td className="px-6 py-4 font-bold text-blue-600">{product.sellPrice} ج.م</td>
                <td className="px-6 py-4">
                  {product.quantity > 10 ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">متوفر</span>
                  ) : product.quantity > 0 ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">قرب النفاذ</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">غير متوفر</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا توجد منتجات مطابقة للبحث</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود المنتج (اتركه فارغاً للتوليد التلقائي)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Library">مكتبة</option>
                    <option value="Uniform">يونيفورم</option>
                    <option value="Advertising">دعاية وإعلان</option>
                  </select>
                </div>

                {formData.category === 'Uniform' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المدرسة / الجهة</label>
                      <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المقاس</label>
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            placeholder="M, L, XL, 32, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اللون</label>
                        <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الشراء</label>
                  <input
                    type="number"
                    required
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                  <input
                    type="number"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية الابتدائية</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size, ...props }: any) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
