const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/signup', authController.registerUser);
router.post('/signin', authController.loginUser);
router.get('/getuser', authController.getUser);

module.exports = router;