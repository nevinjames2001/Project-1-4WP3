const express = require("express");
const db = require("../models/db");
const router = express.Router();

// GET all tasks
router.get("/", (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) return res.status(500).send("Error retrieving tasks");
        res.render("index", { tasks: rows });
    });
});