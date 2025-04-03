const express = require('express');
const router = express.Router();
const { registerNewUser, loginUser, updateUsername, uploadProfileImage, fetchUserStatus } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



router.post('/signup', registerNewUser)
router.post('/login', loginUser)

router.get('/check-status', authenticateUser, fetchUserStatus)

router.patch('/updateUsername', authenticateUser, updateUsername)
router.post('/api/users/upload-profile-image', authenticateUser, upload.single('profileImage'), uploadProfileImage);




module.exports = router