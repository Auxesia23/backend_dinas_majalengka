const express = require('express')
const router = express.Router()
const pengelolaController = require('../controller/pengelolaController')
const multer = require('multer')
const path = require('path')
const verifyToken = require('../middleware/authMiddleware')


const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, 'public/uploads/wisata')
    },
    filename: function(req,file,cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage:storage})

router.get('/getWisata', verifyToken, pengelolaController.getWisata)
router.get('/getHistoryTransaction', verifyToken, pengelolaController.checkHistoryTransaction)
router.get('/getTotalPenjualan', verifyToken, pengelolaController.getTotalPenjualan)
router.get('/getTotalPengunjung', verifyToken, pengelolaController.getTotalVisitor)
router.get('/getDetailHistoryTransaction/:id', verifyToken, pengelolaController.checkDetailHistoryTransaction)

router.post('/tambah-wisata',
    verifyToken,
    upload.fields([
        {name: 'wisataImages', maxCount: 6},
        {name: 'wisataImage', maxCount: 1}
    ]),
    pengelolaController.registerWisata
)

router.patch('/updateWisataData',
    verifyToken,
    upload.single('wisataImage'),
    pengelolaController.updateWisataData)

router.patch('/updateWisataGallery',
    verifyToken,
    upload.fields([
        { name: 'wisataImages', maxCount: 6}
    ]),
    pengelolaController.updateWisataGallery
)

router.patch('/updateStatusTransaction/:id', verifyToken, pengelolaController.updateStatusTransaction)

router.post('/addScannerAccount', verifyToken, pengelolaController.addScannerWisata)

module.exports = router