const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// JWT MIDDLEWARE
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).send('User Registered');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).send('User not found');

        if (await bcrypt.compare(password, users[0].password)) {
            const token = jwt.sign({ id: users[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.send('Not Allowed');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
    const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]);
    res.json(tasks);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    await db.query('INSERT INTO tasks (description, user_id) VALUES (?, ?)', [req.body.description, req.user.id]);
    res.sendStatus(201);
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.sendStatus(200);
});

// SERVE STATIC REACT FILES
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Success! Server running on port ${PORT}`);
});


