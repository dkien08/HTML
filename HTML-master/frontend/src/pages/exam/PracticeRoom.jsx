import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { BookOpen, Sparkles, ArrowLeft, CheckCircle2, XCircle, Trophy, Timer, ChevronRight } from "lucide-react";

const PracticeRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [firstAttempts, setFirstAttempts] = useState({});
  const [userStatus, setUserStatus] = useState({});
  const [aiExplanations, setAiExplanations] = useState({});
  const [loadingAI, setLoadingAI] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [nextTimer, setNextTimer] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchPractice = async () => {
      try {
        setLoading(true);
        // Gọi API chế độ ôn tập [cite: 17]
        const res = await api.get(`/exams/code/${code}?mode=practice`);
        setQuestions(res.questions || []);
      } catch (error) {
        console.error("Lỗi 500 hoặc 404 từ Server:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPractice();
    return () => clearInterval(timerRef.current);
  }, [code]);

  const stopNextTimer = () => {
    clearInterval(timerRef.current);
    setNextTimer(null);
  };

  const startNextTimer = () => {
    stopNextTimer();
    if (currentIdx < questions.length - 1) {
      setNextTimer(2);
      timerRef.current = setInterval(() => {
        setNextTimer(prev => {
          if (prev <= 1) {
            stopNextTimer();
            setCurrentIdx(c => c + 1);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeout(() => setIsFinished(true), 1500);
    }
  };

  const handleSelect = (opt) => {
    const currentQ = questions[currentIdx];
    const isCorrect = opt.is_correct === 1 || opt.is_correct === true;
    if (firstAttempts[currentQ.id] === undefined) {
      setFirstAttempts(prev => ({ ...prev, [currentQ.id]: isCorrect }));
    }
    setUserStatus(prev => ({
      ...prev,
      [currentQ.id]: { selectedId: opt.id, isDone: isCorrect }
    }));
    if (isCorrect) startNextTimer();
    else stopNextTimer();
  };

  const handleAskAI = async (qId) => {
    stopNextTimer();
    setLoadingAI(qId);
    try {
      // Gọi AI giải thích [cite: 6, 23]
      const res = await api.post("/exams/explain-question", { question_id: qId });
      setAiExplanations(prev => ({ ...prev, [qId]: res.ai_explanation }));
    } catch (error) {
      alert("AI đang bận, vui lòng thử lại!");
    } finally {
      setLoadingAI(null);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Đang kết nối phòng ôn tập...</div>;
  if (questions.length === 0) return <div className="p-20 text-center text-red-500">Không tìm thấy câu hỏi. Vui lòng kiểm tra mã đề!</div>;

  if (isFinished) {
    const correctCount = Object.values(firstAttempts).filter(v => v).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-2xl text-center">
        <Trophy className="mx-auto text-yellow-500 mb-4" size={60} />
        <h2 className="text-2xl font-black mb-2">Hoàn thành!</h2>
        <p className="text-gray-500 mb-6">Tỉ lệ đúng lần đầu: {accuracy}%</p>
        <button onClick={() => navigate("/")} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Về trang chủ</button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const status = userStatus[currentQ.id] || {};

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border">
        <div className="flex justify-between mb-6">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600"><ArrowLeft/></button>
          {nextTimer && <span className="text-blue-600 font-bold animate-pulse">Chuyển câu sau {nextTimer}s</span>}
        </div>
        <h2 className="text-xl font-bold mb-8">{currentQ.question_text}</h2>
        <div className="space-y-3">
          {currentQ.options.map(opt => {
            const isSelected = status.selectedId === opt.id;
            const isCorrect = opt.is_correct === 1 || opt.is_correct === true;
            let color = "bg-gray-50 border-gray-100";
            if (status.selectedId) {
              if (isCorrect) color = "bg-green-100 border-green-500 text-green-700";
              else if (isSelected) color = "bg-red-100 border-red-500 text-red-700";
            }
            return (
              <button key={opt.id} disabled={status.isDone} onClick={() => handleSelect(opt)} className={`w-full p-4 rounded-xl border-2 text-left transition ${color}`}>
                {opt.option_text}
              </button>
            );
          })}
        </div>
        {(status.selectedId || aiExplanations[currentQ.id]) && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={16}/> Giải thích AI</span>
              {!aiExplanations[currentQ.id] && <button onClick={() => handleAskAI(currentQ.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">Xem giải thích</button>}
            </div>
            <p className="text-sm text-indigo-800">{aiExplanations[currentQ.id] || "Nhấn nút để AI giải thích đáp án."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeRoom;