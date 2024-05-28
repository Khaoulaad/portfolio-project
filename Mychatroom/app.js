require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB models
const Message = require('./models/Message');

// Dummy user database
const users = [
    { id: 1, username: 'user1', passwordHash: '$2b$10$w/NBKfLB9bo5ZdxA8MHUgu3KffsKXa.tbhY8xqYZXdDmGp/mxLxbi' }, // password: 123456a
    { id: 2, username: 'user2', passwordHash: '$2b$10$Rl4OIArRjSJEP7v20W0GcOOcFRqT3i4Y2EQdsvs0wWMuZ2BrwUHRq' }, // password: 123456a
    { id: 3, username: 'user3', passwordHash: '$2b$10$1YXij9sUbpsvaEEJRfmJHu78/HbMWWkgrJVnVE3ilequOLILKBuly' }, // password: 123456a
    { id: 4, username: 'user4', passwordHash: '$2b$10$9wpL0Kfv8aXeADeWgDtXv.GopC8WLPTDLfvr.1AhgiiNintifx3XW' }, // password: 123456a
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

app.get('/username', ensureAuthenticated, (req, res) => {
    res.json({ username: req.user.username });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

let socketsConected = new Set();

io.on('connection', async (socket) => {
    console.log('Socket connected', socket.id);
    socketsConected.add(socket.id);
    io.emit('clients-total', socketsConected.size);

	// Send chat history to newly connected client
     try {
        const messages = await Message.find().sort('dateTime').exec();
        socket.emit('chat-history', messages);
    } catch (err) {
        console.error(err);
    }

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        socketsConected.delete(socket.id);
        io.emit('clients-total', socketsConected.size);
    });

    socket.on('message', (data) => {
        saveMessage(data);  // Call the async function
        socket.broadcast.emit('chat-message', data);
    });

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    });
});

// Define the async function to save messages
async function saveMessage(data) {
    const message = new Message(data);
    try {
        await message.save();
        console.log('Message saved:', message);
    } catch (err) {
        console.error('Error saving message:', err);
    }
}


// Async function to start the server and connect to MongoDB
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');

        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Start the server
startServer();

