import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Layout/Navbar";
import {
  ArrowLeft,
  User,
  Clock,
  Trophy,
  BarChart3,
  Download,
  Loader2,
  Eye,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

const ExamStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- STATE CHO MODAL CHI TIẾT ---
  const [selectedResult, setSelectedResult] = useState(null); // Lưu thông tin người đang xem
  const [detailLoading, setDetailLoading] = useState(false);
  const [details, setDetails] = useState([]); // Lưu danh sách câu hỏi/trả lời

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/exams/${id}/stats`);
        setStats(res.data.stats || []);
        setExamTitle(res.data.exam_title);
        setTotalAttempts(res.data.total_attempts);
      } catch (error) {
        // Handle error...
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id, navigate]);

  const exportExcel = () => {
    /* Giữ nguyên code cũ */
  };

  // --- HÀM MỞ MODAL XEM CHI TIẾT ---
  const handleViewDetail = async (result) => {
    setSelectedResult(result);
    setDetailLoading(true);
    try {
      // Gọi API lấy chi tiết bài làm
      const res = await api.get(`/exams/result-detail/${result.id}`);
      setDetails(res.data);
    } catch (error) {
      alert("Không thể tải chi tiết bài làm");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedResult(null);
    setDetails([]);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 mt-6">
        {/* Header giữ nguyên */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          {/* ... Code header cũ ... */}
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="text-blue-600" /> Thống kê: {examTitle}
              </h1>
              <p className="text-gray-500 text-sm">
                Tổng số lượt làm bài:{" "}
                <span className="font-bold text-blue-600">{totalAttempts}</span>
              </p>
            </div>
          </div>
          {stats.length > 0 && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-md transition whitespace-nowrap"
            >
              <Download size={18} /> Xuất Excel
            </button>
          )}
        </div>

        {/* Bảng thống kê */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {stats.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Chưa có dữ liệu.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider border-b">
                    <th className="p-4 w-16 text-center">Top</th>
                    <th className="p-4">Thí sinh</th>
                    <th className="p-4 text-center">Điểm số</th>
                    <th className="p-4 text-center">Kết quả</th>
                    <th className="p-4 text-right">Thời gian</th>
                    <th className="p-4 text-center">Chi tiết</th>{" "}
                    {/* Cột mới */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50 transition group"
                    >
                      <td className="p-4 text-center font-bold text-gray-400">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">
                          {item.full_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.email}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block w-12 py-1 rounded-lg text-center font-black ${item.score >= 8 ? "bg-green-100 text-green-700" : item.score >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                        >
                          {Number(item.score).toFixed(1)}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">
                        {item.correct_count}/{item.total_questions}
                      </td>
                      <td className="p-4 text-right text-sm text-gray-500">
                        {new Date(item.submitted_at).toLocaleString("vi-VN")}
                      </td>
                      {/* 👇 Nút Xem Chi Tiết */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                          title="Xem chi tiết bài làm"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODAL CHI TIẾT BÀI LÀM --- */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
              {/* Header Modal */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Chi tiết bài làm
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thí sinh:{" "}
                    <span className="font-bold text-blue-600">
                      {selectedResult.full_name}
                    </span>{" "}
                    - Điểm: {selectedResult.score}
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4">
                {detailLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : details.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Không có dữ liệu chi tiết.
                  </div>
                ) : (
                  details.map((d, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${d.is_correct ? "bg-green-50 border-green-200" : "bg-white border-red-200"}`}
                    >
                      <div className="flex gap-3 mb-2">
                        <span
                          className={`font-bold ${d.is_correct ? "text-green-700" : "text-red-600"}`}
                        >
                          Câu {i + 1}:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {d.question_text}
                        </span>
                      </div>

                      <div className="pl-14 space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-24">Đã chọn:</span>
                          <span
                            className={`font-bold flex items-center gap-1 ${d.is_correct ? "text-green-600" : "text-red-600"}`}
                          >
                            {d.is_correct ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {d.selected_text || "Không chọn"}
                          </span>
                        </div>
                        {!d.is_correct && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-24">
                              Đáp án đúng:
                            </span>
                            <span className="font-bold text-green-600 flex items-center gap-1">
                              <CheckCircle2 size={14} /> {d.correct_text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t bg-white rounded-b-2xl flex justify-end">
                <button
                  onClick={closeDetail}
                  className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamStats;
