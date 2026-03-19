---

### 2. File `PROJECT_SPECS.md`
*File này mô tả nghiệp vụ để Cursor hiểu dự án làm về cái gì.*

```markdown
# 📁 TÀI LIỆU YÊU CẦU DỰ ÁN (PROJECT SPECS)
**Tên dự án:** Smart Quiz App
**Mô tả:** Hệ thống thi trắc nghiệm trực tuyến tích hợp AI (Google Gemini) để chấm điểm và giải thích.

## 1. Công nghệ (Tech Stack)
* **Backend:** Node.js, Express.js.
* **Database:** MySQL (Bảng: users, exams, questions, options, results, exam_answers).
* **AI:** Google Gemini 1.5 Flash (Dùng để Chatbot và Giải thích đáp án).
* **Frontend (Dự kiến):** ReactJS (Vite), Axios, Tailwind CSS.

## 2. Danh sách Màn hình & Chức năng (Frontend Requirements)

### 🟢 Auth Module
* **Login/Register:** Form đăng nhập/đăng ký chuẩn. Lưu Token vào LocalStorage.

### 🔵 User Module
* **Profile Page:** Hiển thị thông tin user. Cho phép đổi tên và đổi mật khẩu.

### 🟠 Exam Module
* **Dashboard:** Danh sách các đề thi hiện có.
* **Exam Room:** Giao diện làm bài thi.
    * Hiển thị câu hỏi dạng trắc nghiệm.
    * Có đồng hồ đếm ngược.
    * Nút "Nộp bài" gọi API submit.

### 🟣 Result & Review Module
* **Result Page:**
    * Hiển thị điểm số ngay sau khi nộp.
    * Hiển thị lại danh sách câu hỏi kèm trạng thái Đúng/Sai (Dựa vào API `result-detail`).
    * Nút "Tại sao đúng?" kích hoạt AI giải thích.

### 🟡 AI Chatbot
* **Global Chat:** Một nút Floating Button hoặc trang riêng để chat với AI về kiến thức học tập.