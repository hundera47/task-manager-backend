import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import { pool } from './db.js';
import { verifyToken, isAdmin, isUser } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/secure', verifyToken, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

app.get('/api/test/admin', verifyToken, isAdmin, (req, res) => {
  res.json({ message: '✅ Admin route accessed!', user: req.user });
});

app.get('/api/test/user', verifyToken, isUser, (req, res) => {
  res.json({ message: '✅ User route accessed!', user: req.user });
});

app.get('/', (req, res) => res.send('API running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
