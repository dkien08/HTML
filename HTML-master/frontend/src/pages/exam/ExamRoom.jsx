import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Layout/Navbar";
import {
  Clock,
  CheckCircle,
  FileText,
  Send,
  AlertTriangle,
  X,
} from "lucide-react";

const ExamRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // State Modal xác nhận nộp bài
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // 1. Tải đề thi
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/code/${code}`);
        if (res.data.exam) {
          setExam(res.data.exam);
          setQuestions(res.data.questions || []);
          setTimeLeft(res.data.exam.duration * 60);
        }
      } catch (error) {
        alert("Lỗi tải đề: " + error.message);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [code, navigate]);

  // 2. Timer
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(true); // Hết giờ tự nộp
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSelect = (qId, optionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  // Hàm kích hoạt Modal nộp bài
  const confirmSubmit = () => {
    setShowSubmitModal(true);
  };

  // Hàm Nộp bài thật sự (gọi API)
  const submitExam = async (autoSubmit = false) => {
    const payload = {
      exam_id: exam.id,
      answers: Object.entries(answers).map(([qId, oId]) => ({
        question_id: parseInt(qId),
        option_id: oId,
      })),
    };

    try {
      const res = await api.post("/exams/submit", payload);
      navigate(`/result/${res.data.result_id}`);
    } catch (error) {
      alert("Lỗi nộp bài: " + error.message);
      setShowSubmitModal(false); // Đóng modal nếu lỗi
    }
  };

  if (loading || !exam)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Đang tải...
      </div>
    );

  const currentQ = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto p-4 md:p-6 mt-4 flex flex-col md:flex-row gap-6">
        {/* CỘT TRÁI: Câu hỏi */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6 flex justify-between items-center">
            <h1 className="font-bold text-gray-800 text-lg flex gap-2">
              <FileText className="text-blue-600" /> {exam.title}
            </h1>
            <div
              className={`md:hidden font-mono font-bold px-3 py-1 rounded ${timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border min-h-[500px]">
            <div className="mb-6 text-sm text-gray-500 font-bold uppercase">
              Câu hỏi {currentQIndex + 1}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              {currentQ.question_text}
            </h2>
            <div className="space-y-4">
              {currentQ.options?.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(currentQ.id, opt.id)}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex justify-center items-center mr-4 ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400"}`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span
                      className={`text-base ${isSelected ? "font-bold text-blue-900" : "text-gray-700"}`}
                    >
                      {opt.option_text}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Footer điều hướng */}
            <div className="mt-10 flex justify-between">
              <button
                onClick={() => setCurrentQIndex((p) => Math.max(0, p - 1))}
                disabled={currentQIndex === 0}
                className="px-6 py-2.5 border text-gray-600 font-bold rounded-xl hover:bg-gray-100 disabled:opacity-50"
              >
                Quay lại
              </button>
              {currentQIndex === questions.length - 1 ? (
                <button
                  onClick={confirmSubmit}
                  className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex gap-2 items-center"
                >
                  Nộp bài <Send size={18} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQIndex((p) =>
                      Math.min(questions.length - 1, p + 1),
                    )
                  }
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Panel Điều hướng */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center sticky top-6">
            <div className="text-gray-500 text-sm mb-2 font-bold uppercase">
              Thời gian còn lại
            </div>
            <div
              className={`text-4xl font-mono font-bold flex justify-center gap-2 ${timeLeft < 300 ? "text-red-600 animate-pulse" : "text-slate-800"}`}
            >
              <Clock size={32} /> {formatTime(timeLeft)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-gray-700 mb-4 flex gap-2">
              <CheckCircle size={18} className="text-green-600" /> Danh sách câu
              hỏi
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-10 rounded-lg font-bold text-sm ${idx === currentQIndex ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${answers[q.id] ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Đã làm:</span>
                <span className="font-bold text-blue-600">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <button
              onClick={confirmSubmit}
              className="w-full mt-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition"
            >
              Nộp bài sớm
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN NỘP BÀI */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Bạn có chắc chắn muốn nộp bài?
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn đã trả lời{" "}
                <span className="font-bold text-blue-600">
                  {answeredCount}/{questions.length}
                </span>{" "}
                câu hỏi.
                {questions.length - answeredCount > 0 && (
                  <span className="text-red-500 block mt-1">
                    Vẫn còn {questions.length - answeredCount} câu chưa làm!
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                >
                  Kiểm tra lại
                </button>
                <button
                  onClick={() => submitExam(false)}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-lg"
                >
                  Nộp bài ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRoom;
