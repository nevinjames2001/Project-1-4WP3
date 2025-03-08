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


module.exports = router;