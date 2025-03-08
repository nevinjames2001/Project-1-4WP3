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


router.put("/tasks/update", (req, res) => {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
        return res.status(400).json({ error: "No tasks provided for update." });
    }
    let updatedCount = 0;
    tasks.forEach(task => {
        db.run(
            "UPDATE tasks SET title = ?, category = ?, due_date = ?, description = ?, status = ?, estimated_hours=? WHERE id = ?",
            [task.title, task.category, task.due_date, task.description, task.status,task.estimated_hours, task.id],
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

// DELETE: Remove a task
router.delete("/tasks/delete/:id", (req, res) => {
    const taskId = req.params.id;

    db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
        if (err) {
            console.error("Error deleting task:", err);
            return res.status(500).json({ error: "Error deleting task" });
        }
        res.json({ message: "Task deleted successfully" });
    });
});


// DELETE: Remove all tasks
router.delete("/tasks/deleteAll", (req, res) => {
    db.run("DELETE FROM tasks", function (err) {
        if (err) {
            console.error("Error deleting all tasks:", err);
            return res.status(500).json({ error: "Error deleting all tasks" });
        }
        res.json({ message: "All tasks deleted successfully" });
    });
});
module.exports = router;