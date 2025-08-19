const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const multer = require('multer')
const path = require('path')

//TEST UPLOAD PICTURE
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, 'public/uploads/pengelola')
    },
    filename: function(req,file,cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})
const cpUpload = upload.fields([
    { name: 'ktp', maxCount: 1 },
    { name: 'npwp', maxCount: 1 },
    { name: 'nib', maxCount: 1 },
    { name: 'qr_code', maxCount: 1 }
])

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

router.post('/register-pengelola', cpUpload, authController.register_pengelola)

module.exports = router