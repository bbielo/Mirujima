const router = require("express").Router();
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

router.use(auth);

// user별 Todo 목록 조회 (/api/todoList)
router.get("/", async (req, res) => {
    try {
        const todoList = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(todoList);
    } catch {
        res.status(500).json({ message: "Failed to fetch todoList" });
    }
});

// user별 Todo 생성
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: "Title is required" });

        const todo = await Todo.create({ title, userId: req.userId });
        res.status(201).json(todo);
    } catch {
        res.status(500).json({ message: "Failed to create todo" });
    }
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