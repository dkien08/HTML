# 📘 API Documentation - Smart Quiz App

**Base URL:** `http://localhost:3000/api`
**Auth Header:** `Authorization: Bearer <your_token>` (Dành cho các route có khóa 🔒)

---

## 1. 🔐 Xác thực (Auth)

### **Đăng ký**

- `POST /auth/register`
- Body: `{ "username": "...", "password": "...", "full_name": "..." }`

### **Đăng nhập**

- `POST /auth/login`
- Body: `{ "username": "...", "password": "..." }`
- Response: Trả về `token` (Lưu cái này vào localStorage).

---

## 2. 👤 Quản lý Tài khoản (User) 🔒

### **Xem thông tin cá nhân**

- `GET /users/profile`
- Response: `{ "id": 1, "username": "admin", "full_name": "Nguyen Van A", "created_at": "..." }`

### **Cập nhật thông tin (Tên hiển thị)**

- `PUT /users/profile`
- Body: `{ "full_name": "Tên Mới" }`

### **Đổi mật khẩu**

- `PUT /users/change-password`
- Body: `{ "old_password": "...", "new_password": "..." }`

---

## 3. 🤖 AI Chatbot

### **Hỏi đáp kiến thức**

- `POST /chat/ask`
- Body: `{ "message": "Giải thích mô hình OSI?" }`
- Response: `{ "reply": "**Markdown text**..." }`

---

## 4. 📝 Thi cử & Kết quả (Exam Core)

### **Lấy danh sách đề thi**

- `GET /exams`

### **Lấy chi tiết đề thi (để làm bài)**

- `GET /exams/:id`
- Response: Trả về thông tin đề và danh sách câu hỏi.

### **Nộp bài thi (Tính điểm)** 🔒

- `POST /exams/submit`
- Body:
  ```json
  {
    "exam_id": 1,
    "answers": [
      { "question_id": 1, "option_id": 2 },
      { "question_id": 2, "option_id": 5 }
    ]
  }
  Response: { "message": "...", "score": 8.5, "result_id": 15 } (Lưu ý: Có trả về result_id).
  ```

Xem lại chi tiết bài làm (Phúc khảo) 🔒
GET /exams/result-detail/:resultId

Response: Trả về từng câu hỏi, đáp án bạn chọn, đáp án đúng và lời giải thích.

Luyện tập: Kiểm tra đáp án tức thì
POST /exams/check-answer

Body: { "question_id": 1, "option_id": 2 }

Response: { "is_correct": true, "ai_explanation": "..." }
