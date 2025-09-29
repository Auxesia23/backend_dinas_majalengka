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

router.get('/getMostPopularByTickets', wisataController.getMostPopularByTickets)
router.get('/:id', wisataController.getWisataDetail)
router.get('/', wisataController.getListWisata)
router.post('/showQrDynamicSingle/:id', verifyToken, wisataController.getQrDynamicSingle)
router.post('/showQrDynamicBundle/:id', verifyToken, wisataController.getQrDynamicBundle)
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