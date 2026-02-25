// 📁 MIRUJIMA/server/src/routes/todos.js

const router = require("express").Router();
const Todo = require("../models/Todo");


// 전체 Todo 조회 (/api/todos)
router.get("/", async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch todos" });
    }
});


// Todo 생성 (/api/todos)
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
        return res.status(400).json({ message: "Title is required" });
        }

        const todo = await Todo.create({ title });

        res.status(201).json(todo);
    } catch (err) {
        res.status(500).json({ message: "Failed to create todo" });
    }
});


// todo 수정 -완료/제목 변경 (/api/todos/:id)
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Todo.findByIdAndUpdate(id, req.body, {
        new: true, // 수정된 결과 반환
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Failed to update todo" });
    }
});


// todo 삭제 (/api/todos/:id)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await Todo.findByIdAndDelete(id);

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: "Failed to delete todo" });
    }
});


module.exports = router;