const express = require("express");
const db = require("../models/db");
const router = express.Router();

router.use(express.json());

// GET all tasks
router.get("/", (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) return res.status(500).send("Error retrieving tasks");
        const today = new Date().toISOString().split("T")[0];
        
        rows.forEach(task => {
            task.isOverdue=task.due_date < today;
        })
        rows = rows.map(task => ({ ...task, disabled: true }));

        res.render("index", { tasks: rows });
    });
});

// POST: Create new task
router.post("/tasks/add", (req, res) => {
    const { title, description, category, due_date, status,estimated_hours } = req.body;

    if (!title || !category) {
        return res.status(400).json({ error: "Task Name and Category are required" });
    }

    db.run(
        "INSERT INTO tasks (title, description, category, due_date, status,estimated_hours) VALUES (?, ?, ?, ?, ?,?)",
        [title, description, category, due_date, status,estimated_hours],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Error adding task" });
            }
            res.json({ message: "Task added successfully", taskId: this.lastID });
        }
    );
});

module.exports = router;