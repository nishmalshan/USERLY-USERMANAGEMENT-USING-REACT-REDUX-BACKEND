const express = require('express');
const router = express.Router();
const { getAllUsers, blockUser, unblockUser } = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/adminMiddleware');








router.get('/dashboard', authenticateAdmin, getAllUsers);
router.put('/users/:userId/block', blockUser)
router.put('/users/:userId/unblock', unblockUser)


module.exports = router