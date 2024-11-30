// In admin.js (ES Module Syntax)
import express from 'express';
const router = express.Router();

// Admin routes go here
router.get('/dashboard', (req, res) => {
    res.send('Admin Dashboard');
});

export default router;  // Use default export for router
