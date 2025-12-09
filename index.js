const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/dbconnection');
const routeChanneler = require('./routeChanner/routeChanneler');
const User = require('./models/user.model'); 
const { metricsMiddleware, metricsRegister , errorLoggerMiddleware , captureResponseBody } = require('./middlewares/metric.middleware'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app); 

// --- 1. GLOBAL METRICS MIDDLEWARE (Entry Point) ---
// Apply to ALL requests to measure total load and response time.
app.use(metricsMiddleware); 
// ---------------------------------------------------

const webhookRoutes = require('./routes/webhook.routes');

// Webhook routes
app.use('/webhook', webhookRoutes);

// ✅ Setup Socket.IO
// ... (Socket.IO setup remains the same) ...
const io = socketIo(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'https://www.mmrrealty.co.in',
            'https://mmrrealty.co.in',
            "http://162.241.115.194:3000",
            'http://real-estate-git-main-manas6699s-projects.vercel.app',
            'https://real-estate-git-main-manas6699s-projects.vercel.app',
            'https://real-estate-git-main-manas6699s-projects.vercel.app/login',
            'https://real-estate-4b8t7xrr6-manas6699s-projects.vercel.app/',
        ],
        methods: ['GET', 'POST' , 'PATCH'],
    },
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

app.set('io', io); 

io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);
    // The server already knows the user's ID from the auth middleware
    const authenticatedUserId = socket.userId; 

    if (authenticatedUserId) {
        console.log(`🔗 Socket ${socket.id} (User: ${authenticatedUserId}) auto-joining room.`);
        // Automatically join the user to their own private room
        socket.join(authenticatedUserId);
    } else {
        console.error(`❌ Socket ${socket.id} connected but has no authenticated userId.`);
    }
    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
    });
});

// ✅ Define allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://www.mmrrealty.co.in',
    "https://mmrrealty.co.in", 
    "http://162.241.115.194:3000",
    'http://real-estate-git-main-manas6699s-projects.vercel.app',
    'https://real-estate-git-main-manas6699s-projects.vercel.app',
    'https://real-estate-git-main-manas6699s-projects.vercel.app/login',
    'https://real-estate-4b8t7xrr6-manas6699s-projects.vercel.app/',
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

// ✅ Other Core Middleware
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. METRICS ENDPOINT ---
// Expose the metrics endpoint for Prometheus scraping.
app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", metricsRegister.contentType);
    const metrics = await metricsRegister.metrics();
    res.send(metrics);
});
// ------------------------

// ✅ Connect to MongoDB
connectDB();
app.use(captureResponseBody);
// ✅ API Routes (All requests that reach this will be tracked by the global middleware)
app.use('/api', routeChanneler);
app.use(errorLoggerMiddleware);

// ✅ Start HTTP server (not app.listen!)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running with Socket.IO on port ${PORT}`));