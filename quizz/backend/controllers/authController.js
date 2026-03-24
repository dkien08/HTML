const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

// ĐĂNG KÝ
exports.register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu thông tin!" });

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0)
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertSql =
      "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)";
    await db.query(insertSql, [
      username,
      hashedPassword,
      full_name,
      role || "users",
    ]);

    return res.status(200).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username
    ]);

    if (users.length === 0)
      return res.status(404).json({ message: "User không tồn tại!" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

    const { password: _, ...userInfo } = user;
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      token: token,
      user: userInfo,
    });
  } catch (err) {
    return res.status(500).json({ error: "System Error: " + err.message });
  }
};