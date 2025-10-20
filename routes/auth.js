import express from 'express';
const router = express.Router();

// temporary test endpoint
router.get('/ping', (req, res) => res.json({ ok: true, msg: 'auth route working' }));

export default router;
