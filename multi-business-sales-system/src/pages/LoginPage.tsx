import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Lock, User as UserIcon, AlertCircle, Users } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showExpiryMessage, setShowExpiryMessage] = useState(false);
  const { users, setCurrentUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const now = new Date();
      const expiry = new Date(user.endDate);
      
      if (now > expiry) {
        setShowExpiryMessage(true);
        return;
      }
      
      setCurrentUser(user);
      navigate('/');
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  if (showExpiryMessage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">انتهاء الصلاحية</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            لقد تم انتهاء صلاحيه هذا المستخدم  
            <br />
            للتفعيل واعاده الاشتراك تواصل مع الدعم الفني على الواتساب  
            <br />
            <span className="font-bold text-blue-600">01016208017</span>
          </p>
          <button
            onClick={() => setShowExpiryMessage(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="mb-8 text-center text-white">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Marqex Sales OS</h1>
        <p className="opacity-80">نظام إدارة المبيعات المتكامل</p>
      </div>

      <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex gap-4 mb-8">
            <button 
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                onClick={() => {}} // Already on login
            >
                <Lock size={18} />
                تسجيل الدخول
            </button>
            <button 
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                onClick={() => navigate('/admin/users')}
            >
                <Users size={18} />
                إدارة المستخدمين
            </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transform transition-all active:scale-95 shadow-lg shadow-blue-500/30"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};
