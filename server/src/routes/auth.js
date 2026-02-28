const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function normalizeUsername(username) {
    return String(username || "").trim();
}

// 회원가입 (/api/auth/register)
router.post("/register", async (req, res) => {
    try {
        const username = normalizeUsername(req.body.username);
        const password = String(req.body.password || "");

        if (!username || !password) {
        return res.status(400).json({ code: "VALIDATION", message: "username and password are required" });
        }
        if (username.length < 3) {
        return res.status(400).json({ code: "VALIDATION", message: "username must be at least 3 chars" });
        }
        if (password.length < 6) {
        return res.status(400).json({ code: "VALIDATION", message: "password must be at least 6 chars" });
        }
        if (!process.env.JWT_SECRET) {
        return res.status(500).json({ code: "SERVER", message: "JWT_SECRET missing" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, passwordHash });

        return res.status(201).json({ id: user._id, username: user.username });
    } catch (err) {
        // username unique 중복이면 MongoDB 에러코드 11000
        if (err && err.code === 11000) {
        return res.status(409).json({ code: "USERNAME_TAKEN", message: "username already exists" });
        }
        return res.status(500).json({ code: "SERVER", message: "register failed" });
    }
});

// 로그인 (/api/auth/login)
router.post("/login", async (req, res) => {
    try {
        const username = normalizeUsername(req.body.username);
        const password = String(req.body.password || "");

        if (!username || !password) {
        return res.status(400).json({ code: "VALIDATION", message: "username and password are required" });
        }
        if (!process.env.JWT_SECRET) {
        return res.status(500).json({ code: "SERVER", message: "JWT_SECRET missing" });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "invalid credentials" });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ code: "INVALID_CREDENTIALS", message: "invalid credentials" });

        const token = jwt.sign(
            { sub: user._id.toString(), username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "60m" }
        );

        return res.json({ token, username: user.username });
    } catch (err) {
        return res.status(500).json({ code: "SERVER", message: "login failed" });
    }
});

module.exports = router;