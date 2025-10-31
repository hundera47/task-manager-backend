//routes/adminRoutes.js
import express from 'express';
import {pool} from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to check admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied — Admins only.' });
  next();
};

// 🟩 GET all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('👑 Admin fetching all users...');
    const result = await pool.query(
      'SELECT id, name, email, role FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 🟦 POST create user
router.post('/users', verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 🟨 PUT update user
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, role } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role',
      [name, email, role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 🟥 DELETE user
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
