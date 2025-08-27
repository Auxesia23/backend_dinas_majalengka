const express = require('express')
const router = express.Router()
const wisataController = require('../controller/wisataController')
const multer = require('multer')
const path = require('path')
const verifyToken = require('../middleware/authMiddleware')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/buktibayar')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })

router.get('/', wisataController.getListWisata)
router.get('/:id', wisataController.getWisataDetail)
router.get('/showQrCode/:id', verifyToken, wisataController.getQrCodeWisata)
router.post('/beli-tiket/:id',
    verifyToken,
    upload.single('buktibayar'),
    wisataController.buyTicketWisata
)
router.post('/buyTicketBundle/:id',
    verifyToken,
    upload.single('buktibayar'),
    wisataController.buyTicketBundle
)

router.post('/addRating/:id', verifyToken, wisataController.addRating)

module.exports = router