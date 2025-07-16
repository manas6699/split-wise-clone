const cors = require('cors');

const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbconnection');
const routeChanneler = require('./routeChanner/routeChanneler');
const User = require('./models/user.model'); // make sure the path is correct

const app = express();
const server = http.createServer(app); // ✅ use raw HTTP server
const jwt = require('jsonwebtoken');
require('dotenv').config();
// ✅ Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://www.mmrrealty.co.in',
    ],
    credentials: true,
  },
});

// ✅ In-memory online user map
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));

  // Verify token → get user ID
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded.id;
  next();
});

io.on('connection', async (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  await User.findByIdAndUpdate(userId, { online: true });
  io.emit('update-online-status', { userId, online: true });

  socket.on('disconnect', async () => {
    onlineUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { online: false });
    io.emit('update-online-status', { userId, online: false });
  });
});


// ✅ Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.mmrrealty.co.in',
];

// ✅ Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Connect to MongoDB
connectDB();

// ✅ API Routes
app.use('/api', routeChanneler);

// ✅ Start HTTP server (not app.listen!)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running with Socket.IO on port ${PORT}`));
