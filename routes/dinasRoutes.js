const express = require('express')
const router = express.Router()
const dinasController = require('../controller/dinasController')
const verifyToken = require('../middleware/authMiddleware')

router.get('/getPengelola', verifyToken, dinasController.getAllPengelola)
router.get('/getDetailPengelola/:id', verifyToken, dinasController.getDetailPengelola)
router.get('/getQrCodeValidation/:id', verifyToken, dinasController.getQrCodeValidation)
router.patch('/approvePengelola/:id', verifyToken, dinasController.approvePengelola)

router.get('/getAllWisataTotal', verifyToken, dinasController.getTotalWisata)
router.get('/getAllPengelola', verifyToken, dinasController.getApprovedPengelolaCount)
router.get('/getTotalPengunjung', verifyToken, dinasController.getTotalVisitor)
router.get('/getTotalRevenue', verifyToken, dinasController.getTotalRevenue)
router.get('/getTop3Wisata', verifyToken, dinasController.getTopRevenueWisata)
router.get('/getAllWisataRevenue', verifyToken, dinasController.getAllWisataRevenue)

router.get('/getMonthlyRevenueReport/:year/:month', verifyToken, dinasController.getMonthlyRevenue)

module.exports = router