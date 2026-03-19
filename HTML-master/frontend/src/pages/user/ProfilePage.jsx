import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Layout/Navbar';
import { User, Lock, Save, Loader2, KeyRound, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    created_at: '',
    role: 'Sinh viên'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State cho đổi mật khẩu
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 1. Lấy thông tin user mới nhất từ Server khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        // Backend trả về: { id, username, full_name, created_at }
        setUser(prev => ({ ...prev, ...response.data }));
      } catch (err) {
        console.error("Lỗi tải profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // 2. Hàm xử lý cập nhật thông tin (Tên hiển thị)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Gửi field 'full_name' theo đúng format backend
      await api.put('/users/profile', { full_name: user.full_name });
      
      // Cập nhật lại LocalStorage để Navbar cũng đổi tên theo
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, full_name: user.full_name }));
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi cập nhật: ' + (err.response?.data?.message || 'Không thể lưu thay đổi.') });
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setLoading(true);
    try {
      // Gọi API đổi pass: /api/users/change-password
      await api.put('/users/change-password', {
        old_password: passData.currentPassword,
        new_password: passData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Tùy chọn: Tự động đăng xuất sau 2s
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setMessage({ type: 'error', text: 'Đổi mật khẩu thất bại: ' + (err.response?.data?.message || 'Mật khẩu cũ không đúng.') });
    } finally {
      setLoading(false);
    }
  };

  // Helper format ngày tháng (từ 2026-01-25T... -> 25/01/2026)
  const formatDate = (dateString) => {
    if (!dateString) return '...';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="text-blue-600" /> Hồ sơ cá nhân
        </h1>

        {/* Thông báo lỗi/thành công */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.type === 'success' ? <span className="text-xl">✅</span> : <span className="text-xl">⚠️</span>}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 -mt-10 border-4 border-white shadow-md">
                <User size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.full_name || 'Đang tải...'}</h2>
              <p className="text-gray-500 text-sm mt-1 font-mono">@{user.username}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-4">
                <div className="text-sm flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar size={14}/> Ngày tham gia</span>
                  <span className="font-medium text-gray-800">{formatDate(user.created_at)}</span>
                </div>
                <div className="text-sm flex justify-between items-center">
                  <span className="text-gray-500">Vai trò</span>
                  <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded uppercase">Sinh viên</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Form 1: Đổi tên hiển thị */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <Save size={18} className="text-blue-500" /> Cập nhật thông tin
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên hiển thị</label>
                  <input
                    type="text"
                    value={user.full_name || ''}
                    onChange={(e) => setUser({...user, full_name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="text-right">
                  <button disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm shadow-blue-200">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Đổi mật khẩu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                <KeyRound size={18} className="text-orange-500" /> Bảo mật
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                      value={passData.currentPassword}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      value={passData.newPassword}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                      value={passData.confirmPassword}
                    />
                  </div>
                </div>
                <button 
                  disabled={loading} 
                  className="w-full mt-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-black transition flex justify-center items-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Cập nhật mật khẩu'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;