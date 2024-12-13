"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const db = new sqlite3_1.default.Database('./posts.db');
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
});
app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    const id = (0, uuid_1.v4)();
    if (!title || !content) {
        res.status(422).json({ message: 'Some fields are empty!!!' });
        return;
    }
    db.run('INSERT INTO posts (id, title, content) VALUES (?, ?, ?)', [id, title, content], (err) => {
        if (err) {
            res.status(500).json({ message: 'Failed to create post' });
        }
        else {
            res.json({ id, title, content });
        }
    });
});
app.get('/posts', (req, res) => {
    db.all('SELECT * FROM posts', (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Failed to get posts' });
        }
        else {
            res.json(rows);
        }
    });
});
app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ message: 'Failed to get post' });
        }
        else if (!row) {
            res.status(404).json({ message: 'Post not found' });
        }
        else {
            res.json(row);
        }
    });
});
app.delete('/posts/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
        if (err) {
            res.status(500).json({ message: 'Failed to delete post' });
        }
        else {
            res.json({ message: 'Post deleted' });
        }
    });
});
app.put('/posts/:id', (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], (err) => {
        if (err) {
            res.status(500).json({ message: 'Failed to update post' });
        }
        else {
            res.json({ id, title, content });
        }
    });
});
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
