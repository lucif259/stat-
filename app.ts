import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const db = new sqlite3.Database('./posts.db');

app.use(cors());
app.use(bodyParser.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
});

app.post('/posts', (req: Request, res: Response) => {
  const { title, content } = req.body;
  const id = uuidv4();

  if(!title || !content) {
    res.status(422).json({ message: 'Some fields are empty!!!' });
    return
  }


  db.run('INSERT INTO posts (id, title, content) VALUES (?, ?, ?)', [id, title, content], (err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to create post' });
    } else {
      res.json({ id, title, content });
    }
  });
});

app.get('/posts', (req: Request, res: Response) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Failed to get posts' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ message: 'Failed to get post' });
    } else if (!row) {
      res.status(404).json({ message: 'Post not found' });
    } else {
      res.json(row);
    }
  });
});

app.delete('/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to delete post' });
    } else {
      res.json({ message: 'Post deleted' });
    }
  });
});

app.put('/posts/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, content } = req.body;

  db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], (err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to update post' });
    } else {
      res.json({ id, title, content });
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});