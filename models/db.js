const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("tasks.db");

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        due_date date,
        estimated_hours REAL,
        created_at TEXT DEFAULT (datetime('now')),
        status TEXT CHECK(status IN ('Pending', 'Completed', 'Overdue'))
    )`);
});

module.exports = db;
