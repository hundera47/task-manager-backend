import express from 'express';
import { pool } from '../db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 🟢 Create Task
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    await pool.query(
      'INSERT INTO tasks (title, description, due_date, owner_id) VALUES ($1, $2, $3, $4)',
      [title, description, due_date, req.user.id]
    );

    res.json({ message: '✅ Task created successfully' });
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(500).json({ error: 'Server error creating task' });
  }
});

/**
 * 🟡 Get Tasks
 * - Admin: all tasks
 * - User: only their own
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    let query, values;
    if (req.user.role === 'admin') {
      query = `
        SELECT tasks.*, users.name AS owner_name
        FROM tasks
        LEFT JOIN users ON tasks.owner_id = users.id
        ORDER BY due_date ASC;
      `;
      values = [];
    } else {
      query = 'SELECT * FROM tasks WHERE owner_id = $1 ORDER BY due_date ASC;';
      values = [req.user.id];
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Get Tasks Error:', err);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
});

/**
 * 🟠 Update Task (status or fields)
 * - Owner or Admin
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;

    // check ownership or admin
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = rows[0];

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'admin' && task.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to edit this task' });
    }

    await pool.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4 WHERE id=$5`,
      [title, description, status, due_date, id]
    );

    res.json({ message: '✅ Task updated successfully' });
  } catch (err) {
    console.error('Update Task Error:', err);
    res.status(500).json({ error: 'Server error updating task' });
  }
});

/**
 * 🔴 Delete Task
 * - Owner or Admin
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query('SELECT * FROM tasks WHERE id=$1', [id]);
    const task = rows[0];

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'admin' && task.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to delete this task' });
    }

    await pool.query('DELETE FROM tasks WHERE id=$1', [id]);
    res.json({ message: '🗑️ Task deleted successfully' });
  } catch (err) {
    console.error('Delete Task Error:', err);
    res.status(500).json({ error: 'Server error deleting task' });
  }
});

export default router;
