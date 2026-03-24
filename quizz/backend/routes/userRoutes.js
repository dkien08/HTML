const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

// Lấy thông tin bản thân
router.get("/profile", verifyToken, userController.getProfile);

// Cập nhật tên
router.put("/profile", verifyToken, userController.updateProfile);

// Đổi mật khẩu
router.put("/change-password", verifyToken, userController.changePassword);

// // Lấy danh sách (Đang phát triển)
// router.get("/list", verifyToken, userController.getAllUsers);

module.exports = router;
