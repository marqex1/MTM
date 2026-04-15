import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, User } from '../store';
import { ArrowRight, Lock, UserPlus, Trash2, Calendar, Shield, X, AlertCircle } from 'lucide-react';

export const UserManagement = () => {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const { users, addUser, deleteUser } = useStore();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Sales' as 'Admin' | 'Sales',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '01032869945Marqex') {
      setIsAdminAuth(true);
      setAuthError('');
    } else {
      setAuthError('كلمة مرور الإدارة غير صحيحة');
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: formData.username,
      password: formData.password,
      role: formData.role,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: true,
    };
    addUser(newUser);
    setShowAddModal(false);
    setFormData({
      username: '',
      password: '',
      role: 'Sales',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowRight size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">إدارة النظام</h2>
          </div>
          
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة مرور النظام الرئيسية</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>
            {authError && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {authError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors"
            >
              دخول كمسؤول نظام
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-200 rounded-full">
                <ArrowRight size={24} className="text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
            </div>
            <p className="text-gray-500">إضافة وتعديل صلاحيات الوصول للنظام</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={20} />
            إضافة مستخدم جديد
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {user.username[0].toUpperCase()}
                </div>
                <div className={user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold' : 'bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold'}>
                  {user.role === 'Admin' ? 'مدير كامل' : 'مبيعات فقط'}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.username}</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>تاريخ البداية: {user.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span className={new Date(user.endDate) < new Date() ? 'text-red-500 font-bold' : ''}>تاريخ الانتهاء: {user.endDate}</span>
                </div>
              </div>
              {user.username !== 'MTM' && (
                <button
                  onClick={() => deleteUser(user.id)}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  حذف المستخدم
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إضافة مستخدم</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="Sales">Sales (فواتير فقط)</option>
                  <option value="Admin">Admin (تحكم كامل)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors mt-4"
              >
                حفظ المستخدم
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
