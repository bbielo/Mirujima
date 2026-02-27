const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ code: "NO_TOKEN", message: "Login required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.sub; // 로그인한 유저 id
        req.username = payload.username;
        next();
    } catch (err) {
        return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid token" });
    }
}

module.exports = auth;