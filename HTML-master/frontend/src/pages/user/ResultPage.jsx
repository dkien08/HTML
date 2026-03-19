import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Layout/Navbar';
import { Trophy, Clock, Target, Home, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Gọi API lấy kết quả theo ID
        const res = await api.get(`/exams/result/${id}`);
        setResult(res.data);
      } catch (error) {
        console.error("Lỗi lấy kết quả:", error);
        alert("Không tìm thấy kết quả thi!");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex justify-center items-center">Đang tính điểm...</div>;
  if (!result) return null;

  // Tính toán màu sắc dựa trên điểm số
  const scoreColor = result.score >= 8 ? 'text-green-600' : result.score >= 5 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = result.score >= 8 ? 'bg-green-50' : result.score >= 5 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />
      
      <main className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-center text-white">
                <div className="inline-block p-4 rounded-full bg-white/10 mb-4">
                    <Trophy size={48} className="text-yellow-400" />
                </div>
                <h1 className="text-2xl font-bold mb-1">{result.title}</h1>
                <p className="text-slate-400">Mã đề: {result.code}</p>
            </div>

            {/* Điểm số */}
            <div className="p-8 text-center">
                <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Điểm số của bạn</div>
                <div className={`text-6xl font-black mb-6 ${scoreColor}`}>
                    {result.score}
                </div>

                {/* Thống kê chi tiết */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`${scoreBg} p-4 rounded-2xl border border-gray-100`}>
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                            <CheckCircle size={18} className="text-green-500"/> Số câu đúng
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                            {result.correct_count} / {result.total_questions}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                            <Clock size={18} className="text-blue-500"/> Thời gian nộp
                        </div>
                        <div className="text-sm font-bold text-gray-800 pt-1">
                            {new Date(result.finished_at).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Nút điều hướng */}
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> Về trang chủ
                    </button>
                    <button 
                        onClick={() => navigate(`/room/${result.code}`)}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} /> Làm lại đề này
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;