const express = require("express");
const db = require("../models/db");
const router = express.Router();

router.use(express.json());

// GET all tasks
router.get("/", (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) return res.status(500).send("Error retrieving tasks");

        rows = rows.map(task => ({ ...task, disabled: true }));

        res.render("index", { tasks: rows });
    });
});

// POST: Create new task
router.post("/tasks/add", (req, res) => {
    const { title, description, category, due_date, status } = req.body;

    if (!title || !category) {
        return res.status(400).json({ error: "Task Name and Category are required" });
    }

    db.run(
        "INSERT INTO tasks (title, description, category, due_date, status) VALUES (?, ?, ?, ?, ?)",
        [title, description, category, due_date, status],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Error adding task" });
            }
            res.json({ message: "Task added successfully", taskId: this.lastID });
        }
    );
});

router.put("/tasks/update", (req, res) => {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
        return res.status(400).json({ error: "No tasks provided for update." });
    }
    let updatedCount = 0;
    tasks.forEach(task => {
        db.run(
            "UPDATE tasks SET title = ?, category = ?, due_date = ?, description = ?, status = ? WHERE id = ?",
            [task.title, task.category, task.due_date, task.description, task.status, task.id],
            function (err) {
                if (err) {
                    console.error("Error updating task:", err);
                    return res.status(500).json({ error: "Error updating tasks." });
                }
                updatedCount++;
                if (updatedCount === tasks.length) {
                    res.json({ message: "Tasks updated successfully." });
                }
            }
        );
    });
});

// POST: Delete a task
router.post("/delete/:id", (req, res) => {
    db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send("Error deleting task");
        res.redirect("/");
    });
});

module.exports = router;