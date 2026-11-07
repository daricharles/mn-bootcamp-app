const express = require('express');
const helmet = require('helmet');
const sqlite3 = require('sqlite3');
const _ = require('lodash');

const app = express();
app.use(helmet());

const db = new sqlite3.Database(':memory:');

const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER, name TEXT, email TEXT)');
  db.run("INSERT INTO users VALUES (1, 'ama', 'ama@example.com')");
  db.run("INSERT INTO users VALUES (2, 'kofi', 'kofi@example.com')");
});

app.get('/user', (req, res) => {
  const name = String(req.query.name || '');
  if (!/^[a-z]{1,20}$/i.test(name)) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  db.all('SELECT * FROM users WHERE name = ?', [name], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
    res.json(rows);
  });
});

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

app.get('/search', (req, res) => {
  const query = req.query.q ?? '';
  res.send('<h1>Results for ' + escapeHtml(query) + '</h1>');
});

app.get('/settings', (req, res) => {
  res.json(_.merge({ theme: 'light' }, JSON.parse(req.query.data || '{}')));
});

app.get('/admin', (req, res) => {
  if (!API_KEY || req.get('x-api-key') !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(3000, '127.0.0.1', () => console.log('http://localhost:3000'));
