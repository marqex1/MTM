import React, { useState } from 'react';
import { useStore } from '../store';
import { Settings as SettingsIcon, Upload, Download, Trash2, Building2, Phone, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings, resetSystem, products, invoices, customers, users } = useStore();
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const exportData = () => {
    const data = { settings, products, invoices, customers, users };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marqex_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          // In a real app, you'd want to validate and merge this data
          localStorage.setItem('marqex-sales-os-storage', event.target?.result as string);
          window.location.reload();
        } catch (err) {
          alert('فشل استيراد البيانات: ملف غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من تصفير النظام بالكامل؟ سيتم حذف جميع المنتجات والفواتير والعملاء.')) {
        resetSystem();
        alert('تم تصفير النظام بنجاح');
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-500" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
        <p className="text-gray-500">تخصيص بيانات الشركة والتحكم في قاعدة البيانات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding Settings */}
        <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    بيانات الشركة (تظهر في الفواتير)
                </h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المؤسسة</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-3">لوجو الشركة</label>
                            <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Company Logo" className="w-full h-32 object-contain rounded-lg mb-2" />
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center bg-gray-50 text-gray-400">
                                        <Building2 size={40} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <p className="text-xs text-gray-500 font-medium">اضغط لتغيير اللوجو</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            حفظ التغييرات
                        </button>
                        {isSaved && (
                            <span className="text-green-600 font-medium animate-in fade-in duration-300">تم الحفظ بنجاح ✨</span>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* Data Management */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Upload size={20} className="text-purple-600" />
                    النسخ الاحتياطي
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">احتفظ بنسخة من بياناتك بانتظام لتجنب فقدانها. يمكنك تصدير ملف يحتوي على كل الفواتير والمنتجات.</p>
                <div className="space-y-3">
                    <button
                        onClick={exportData}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                    >
                        <Download size={18} />
                        تصدير البيانات (JSON)
                    </button>
                    <label className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload size={18} />
                        استيراد بيانات قديمة
                        <input type="file" className="hidden" accept=".json" onChange={importData} />
                    </label>
                </div>
            </div>

            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    منطقة الخطر
                </h3>
                <p className="text-sm text-red-600 mb-6 opacity-80">تصفير النظام سيؤدي إلى حذف كافة السجلات بشكل نهائي ولا يمكن التراجع عن هذه الخطوة.</p>
                <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                    <Trash2 size={18} />
                    تصفير كافة البيانات
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
