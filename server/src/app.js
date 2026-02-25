// 환경변수 로드
require("dotenv").config({ override: true });

// DNS 설정
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // IPv6 대신 IPv4 우선 사용하도록 설정
dns.setServers(["1.1.1.1", "8.8.8.8"]); // bugfix: Windows DNS 이슈 방지용

/** CORS -> JSON 파싱 -> 라우터 */
// 라이브러리 로드
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const todoRoutes = require("./routes/todos");

// 앱 초기화
const app = express();
const PORT = process.env.PORT || 4000;

// 전역 미들웨어
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// 라우터
app.use("/api/todos", todoRoutes);

// test용
app.get("/", (req, res) => {
    res.send("MIRUJIMA API is running");
});

app.get("/health", (req, res) => {
    res.json({ ok: true, name: "MIRUJIMA server" });
});

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ DB connect failed:", err.message);
        process.exit(1);
    }
}

startServer();