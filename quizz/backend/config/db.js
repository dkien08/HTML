const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Kiểm tra kết nối
db.getConnection()
    .then(connection => {
        console.log('Đã kết nối thành công với Database');
        connection.release();
    })
    .catch(err => {
        console.error('Kết nối Database thất bại: ' + err.message);
        console.error('Mã lỗi (Code):', err.code);
    });

module.exports = db;