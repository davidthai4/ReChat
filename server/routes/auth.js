const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/AuthMiddleware');
const {
    signup,
    login,
    getUserInfo,
    updateProfile,
    addProfileImage,
    removeProfileImage,
    logout,
} = require('../controllers/AuthController');

const upload = multer({ dest: 'uploads/profiles/' });

router.post('/signup', signup);
router.post('/login', login);
router.get('/user-info', verifyToken, getUserInfo);
router.post('/update-profile', verifyToken, updateProfile);
router.post('/add-profile-image', verifyToken, upload.single('profile-image'), addProfileImage);
router.delete('/remove-profile-image', verifyToken, removeProfileImage);
router.post('/logout', logout);

module.exports = router;
