const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const socketEvents = require('./utils/socketEvents');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Izinkan semua origin (hanya untuk pengembangan!)
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/projects', require('./routes/api/projects'));
app.use('/api/tasks', require('./routes/api/tasks'));

// Initialize socket events
socketEvents(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));