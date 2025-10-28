const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Use a fixed port for local testing (for DuckDNS, we forward external 80 to this port)
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS) from public/
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root URL to login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read users.txt
    let users;
    try {
        users = fs.readFileSync('users.txt', 'utf8').split('\n');
    } catch (err) {
        return res.json({ success: false, message: 'No users file found.' });
    }

    const match = users.find(u => {
        const [user, pass] = u.trim().split(':');
        return user === username && pass === password;
    });

    if (match) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Incorrect username or password.' });
    }
});

// SIGNUP
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Read current users
    let users = [];
    try {
        users = fs.readFileSync('users.txt', 'utf8').split('\n').map(u => u.trim());
    } catch (err) {
        // file might not exist yet
    }

    // Check if username exists
    if (users.find(u => u.split(':')[0] === username)) {
        return res.json({ success: false, message: 'Username already exists.' });
    }

    // Append new user
    fs.appendFileSync('users.txt', `${username}:${password}\n`);
    res.json({ success: true, message: 'Account created!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
