const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: Thiếu Token xác thực." });
  }

  // Giải mã Token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid Token: Token không hợp lệ hoặc đã hết hạn.",
      });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
