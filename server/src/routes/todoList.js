const router = require("express").Router();
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

router.use(auth);

// user별 Todo 목록 조회 (/api/todoList)
router.get("/", async (req, res) => {
    const { date } = req.query;

    const filter = { userId: req.userId };
    if (date) filter.date = date;

    const list = await Todo.find(filter).sort({ createdAt: -1 });
    res.json(list);
});

// 요약
router.get("/summary", async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) return res.status(400).json({ message: "month is required (YYYY-MM)" });

        const from = `${month}-01`;
        const to = `${month}-31`;

        const list = await Todo.find({
        userId: req.userId,
        date: { $gte: from, $lte: to },
        }).select("date done");

        // date별 { total, remaining } 계산
        const map = {};
        for (const t of list) {
        if (!map[t.date]) map[t.date] = { total: 0, remaining: 0 };
        map[t.date].total += 1;
        if (!t.done) map[t.date].remaining += 1;
        }

        // [{ date, total, remaining }]
        const result = Object.entries(map).map(([date, v]) => ({ date, ...v }));
        res.json(result);
    } catch (e) {
        res.status(500).json({ message: "Failed to load summary" });
    }
});

// user별 Todo 생성
router.post("/", async (req, res) => {
    const { title, date } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const todo = await Todo.create({
        title,
        done: false,
        userId: req.userId,
        date: date || today,
    });

    res.status(201).json(todo);
});

// user별 Todo 수정
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Todo.findOneAndUpdate(
        { _id: id, userId: req.userId },
        req.body,
        { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Todo not found" });

        res.json(updated);
    } catch {
        res.status(500).json({ message: "Failed to update todo" });
    }
});

// user별 Todo 삭제
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.userId });
        if (!deleted) return res.status(404).json({ message: "Todo not found" });

        res.status(204).send();
    } catch {
        res.status(500).json({ message: "Failed to delete todo" });
    }
});

module.exports = router;