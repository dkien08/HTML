import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import {
  BarChart2,
  Clock,
  PlusCircle,
  Search,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Layers,
  User,
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Play,
  Ban,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [publicExams, setPublicExams] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm loading state
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Theo API Docs: GET /exams lấy đề Public [cite: 16]
        // GET /exams/my-exams lấy đề cá nhân 
        const [resPublic, resMy] = await Promise.all([
          api.get("/exams"),
          api.get("/exams/my-exams"),
        ]);
        
        // Đảm bảo dữ liệu là mảng để tránh lỗi .slice() hoặc .map()
        setPublicExams(Array.isArray(resPublic) ? resPublic : (resPublic.data || []));
        setMyExams(Array.isArray(resMy) ? resMy : (resMy.data || []));
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setActiveMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  // Phòng thủ dữ liệu trước khi slice để tránh lỗi trắng màn hình
  const visiblePublicExams = isExpanded 
    ? publicExams 
    : (Array.isArray(publicExams) ? publicExams.slice(0, 4) : []);

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    // Đồng bộ với App.jsx Route: /exam/:code [cite: 16]
    navigate(`/exam/${searchCode.trim().toUpperCase()}`);
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
    try {
      await api.delete(`/exams/${examId}`); // [cite: 22]
      setMyExams((prev) => prev.filter((e) => e.id !== examId));
      setPublicExams((prev) => prev.filter((e) => e.id !== examId));
    } catch (error) {
      alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  const renderExamCard = (exam, isMyExam) => (
    <div
      key={exam.id}
      className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition flex flex-col h-full relative"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
            {exam.code}
          </span>
          {isMyExam && (
            exam.is_public ? <Globe size={14} className="text-green-500" /> : <Lock size={14} className="text-orange-500" />
          )}
        </div>

        {isMyExam ? (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === exam.id ? null : exam.id);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>

            {activeMenuId === exam.id && (
              <div
                ref={menuRef}
                className="absolute right-0 top-8 w-40 bg-white shadow-xl border rounded-lg z-20 overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/exam/edit/${exam.id}`)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex gap-2 text-gray-700"
                >
                  <Edit size={16} className="text-blue-600" /> Sửa đề
                </button>
                <button
                  onClick={() => navigate(`/exam/stats/${exam.id}`)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 flex gap-2 text-gray-700"
                >
                  <BarChart2 size={16} className="text-purple-600" /> Thống kê
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex gap-2 border-t"
                >
                  <Trash2 size={16} /> Xóa đề
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> {exam.duration}'
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 flex-1">
        {exam.title}
      </h3>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-t pt-2 mt-2">
        <div className="flex items-center gap-1">
          <BookOpen size={12} /> {exam.questions?.length || 0} câu
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} /> {exam.duration}'
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        {/* Nút Ôn tập: Route /practice/:code  */}
        <button
          onClick={() => navigate(`/practice/${exam.code}`)}
          className="flex items-center justify-center gap-1 py-2 bg-amber-50 text-amber-700 font-bold rounded-lg text-xs hover:bg-amber-100 transition"
        >
          <BookOpen size={14} /> Ôn tập
        </button>
        {/* Nút Vào thi: Route /exam/:code [cite: 16] */}
        <button
          onClick={() => navigate(`/exam/${exam.code}`)}
          className="flex items-center justify-center gap-1 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-black transition"
        >
          <Play size={14} fill="currentColor" /> Vào thi
        </button>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-center py-20">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-6xl mx-auto p-6 space-y-10">
        {/* Phần tham gia nhanh */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tham gia thi nhanh</h2>
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã code..."
                className="flex-1 border-2 rounded-xl px-4 py-3 font-mono uppercase focus:border-blue-500 outline-none"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 transition">
                <Search size={20} /> Vào Thi
              </button>
            </form>
          </div>
          <Link
            to="/exam/create"
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:scale-105 transition shadow-lg"
          >
            <PlusCircle size={20} /> Tạo Đề Mới
          </Link>
        </section>

        {/* Đề thi của tôi */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="text-blue-600" /> Đề thi của tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myExams.length > 0 ? myExams.map((e) => renderExamCard(e, true)) : <p className="text-gray-400 italic">Bạn chưa tạo đề thi nào.</p>}
          </div>
        </section>

        {/* Thư viện công khai */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="text-green-600" /> Thư viện công khai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {visiblePublicExams.map((e) => renderExamCard(e, false))}
          </div>
          {publicExams.length > 4 && (
            <div className="flex justify-center">
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 px-6 py-2 bg-white border rounded-full shadow-sm text-gray-700 hover:text-blue-600 transition">
                {isExpanded ? <>Thu gọn <ChevronUp size={18} /></> : <>Xem tất cả <ChevronDown size={18} /></>}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;