const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

require('dotenv').config();

// SQLite file location. On Render's free tier this disk is wiped on every
// restart/redeploy, which is fine for a test backend.
const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'taskManager.db');

if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        _id        TEXT PRIMARY KEY,
        username   TEXT NOT NULL UNIQUE,
        email      TEXT NOT NULL UNIQUE,
        password   TEXT NOT NULL,
        role       TEXT NOT NULL DEFAULT '["taskWorker"]',
        createdAt  TEXT NOT NULL,
        updatedAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
        _id         TEXT PRIMARY KEY,
        createdBy   TEXT NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        description TEXT,
        dueDate     TEXT,
        status      TEXT NOT NULL DEFAULT '["PENDING"]',
        assignedTo  TEXT NOT NULL DEFAULT '',
        createdAt   TEXT NOT NULL,
        updatedAt   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_createdBy ON tasks(createdBy);
`);

// 24-char hex ids, same format as MongoDB ObjectIds, so the API contract is unchanged.
const newId = () => crypto.randomBytes(12).toString('hex');

const now = () => new Date().toISOString();

// Builds an error shaped like a Mongoose ValidationError so Middleware/errorHandling.js handles it unchanged.
function validationError(fieldErrors) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {};
    for (const [field, message] of Object.entries(fieldErrors)) {
        err.errors[field] = { properties: { message, path: field } };
    }
    return err;
}

module.exports = { db, dbPath, newId, now, validationError };
