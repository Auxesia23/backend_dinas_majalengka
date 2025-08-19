require('dotenv').config()
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_KEY

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).json({ message: "Token tidak ada" });
    
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token tidak valid" });
        req.user = decoded;
        next();
    });
}

module.exports = verifyToken