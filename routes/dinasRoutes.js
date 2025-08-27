const express = require('express')
const router = express.Router()
const dinasController = require('../controller/dinasController')
const verifyToken = require('../middleware/authMiddleware')

router.get('/getPengelola', verifyToken, dinasController.getAllPengelola)
router.get('/getDetailPengelola/:id', verifyToken, dinasController.getDetailPengelola)
router.patch('/approvePengelola/:id', verifyToken, dinasController.approvePengelola)

module.exports = router