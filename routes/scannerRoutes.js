const express = require('express')
const router = express.Router()
const scannerController = require('../controller/scannerController')
const verifyToken = require('../middleware/authMiddleware')

router.put('/:idTransaction/:idTicket', verifyToken, scannerController.scanTicket)

module.exports = router