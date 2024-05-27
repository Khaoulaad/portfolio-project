require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Dummy user database
const users = [
    { id: 1, username: 'user1', passwordHash: '$2b$10$yldw.BOAMFeeyeCM9UYy9O65DSI7c7W1MD9qcobIicDm0M5rBAjia' }, // password: 123456a
    { id: 2, username: 'user2', passwordHash: '$2b$10$RUO2D8YkNJVHCLDOsss24eZ1OMMoZLxhtNj.wHtgA84UZ0erImUVO' }, // password: 123456a
    // Add other users here with hashed passwords
];

// Passport configuration
passport.use(new LocalStrategy((username, password, done) => {
    console.log("Attempting login for user:", username);
    const user = users.find(u => u.username === username);
    if (!user) {
        console.log("User not found:", username);
        return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.compare(password, user.passwordHash, (err, result) => {
        if (err) return done(err);
        if (!result) {
            console.log("Incorrect password for user:", username);
            return done(null, false, { message: 'Incorrect password.' });
        }
        console.log("Login successful for user:", username);
        return done(null, user);
    });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Serve the chatroom page
app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//thisforsocket
app.use(express.static(path.join(__dirname, 'public')))

let socketsConected = new Set()

io.on('connection', onConnected)

function onConnected(socket) {
  console.log('Socket connected', socket.id)
  socketsConected.add(socket.id)
  io.emit('clients-total', socketsConected.size)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketsConected.delete(socket.id)
    io.emit('clients-total', socketsConected.size)
  })

  socket.on('message', (data) => {
    // console.log(data)
    socket.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}

app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get the authenticated username
app.get('/username', ensureAuthenticated, (req, res) => {
    res.json({ username: req.user.username });
});
// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
