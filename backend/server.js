const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'FoodHaven API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
let server;

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`FoodHaven backend running on port ${PORT}`);
  });
} else {
  // In production/Vercel, we don't call app.listen()
  // Vercel handles the server lifecycle
  server = require('http').createServer(app);
}

// Socket.io Setup - Note: This will not work on standard Vercel Serverless Functions
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

module.exports = app;
