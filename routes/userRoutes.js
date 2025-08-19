const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const verifyToken = require('../middleware/authMiddleware')

router.get('/info', verifyToken, userController.getProtected)
router.get('/getAllUser', verifyToken, userController.getAllUser)

module.exports = router