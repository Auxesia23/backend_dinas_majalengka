require('dotenv').config();
const { User, Pengelola} = require('../models')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const idGenerator = require('../helper/userIdGenerator')
const sequelize = require('sequelize')
const transporter = require('../helper/email')

const SECRET_KEY = process.env.JWT_KEY

//REGISTER
const register = async(req, res) => {
    const body = req.body
    
    const hashedPassword = await bcrypt.hash(body.password_hash, 10);
    if (!hashedPassword) {
        res.status(400).json({message: "Please enter a password!"})
    }
    try {
        const newUserId = await idGenerator.generateUserId()
        const user = await User.create({ 
            id_user:newUserId,
            id_role: 'USR',
            nama_lengkap:body.nama_lengkap,
            email:body.email,
            tanggal_lahir:body.tanggal_lahir,
            no_telpon:body.no_telpon,
            gender:body.gender,
            password_hash:hashedPassword
        })
        res.status(200).json({ message: "Register berhasil", table_user: user});
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//PENGELOLA
//REGISTER
const registerPengelola = async (req,res) => {
    const body = req.body
    const hashedPassword = await bcrypt.hash(body.password_hash, 10)
    try {
        const files = req.files
        if (!files || !files.ktp || !files.npwp || !files.nib || !files.qr_code) {
            return res.status(400).json({ message: 'Lengkapin semua dokumen dulu, bro.' });
        }
        const ktpUrl = files.ktp[0].path;
        const npwpUrl = files.npwp[0].path;
        const nibUrl = files.nib[0].path;
        const qrCodeUrl = files.qr_code[0].path;
    
        const newUserId = await idGenerator.generateUserId()
        const user = await User.create({ 
            id_user:newUserId,
            id_role: 'PNGL',
            nama_lengkap:body.nama_lengkap,
            email:body.email,
            tanggal_lahir:body.tanggal_lahir,
            no_telpon:body.no_telpon,
            gender:body.gender,
            password_hash:hashedPassword
        })
        const newPengelolaId = await idGenerator.generatePengelolaId()
        const pengelola = await Pengelola.create({
            id_pengelola:newPengelolaId,
            id_user:user.id_user,
            tahun_operasi:body.tahun_operasi,
            url_ktp:ktpUrl,
            url_npwp:npwpUrl,
            url_nib:nibUrl,
            qr_code:qrCodeUrl
        })
        res.status(200).json({message:"Register Pengelola Berhasi;", user: user, pengelola: pengelola})
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//LOGIN
const login = async(req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ 
            where: { email }
        });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ message: "Password salah" });
    
        const payload = {
            id_user: user.id_user,
            id_role: user.id_role,
            nama_lengkap: user.nama_lengkap,
        }

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    
        res.status(200).json({ message: "Login berhasil", token });
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//FORGOT PASSWORD
const forgotPassword = async(req,res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({where: {email}})
        if (!user) {
            res.status(404).json({message:"User Not Found"})
        }
        const token = crypto.randomBytes(20).toString('hex')
        const expiryDate = Date.now() + 1800000
        user.reset_password_token = token
        user.reset_password_expires = expiryDate
        await user.save()
        
        const mailOption = {
            from: 'Admin@relawanmate.site',
            to: user.email,
            subject: 'Password reset',
            html: `
                <h3>Hello, ${user.nama_lengkap}</h3>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="http://localhost:5173/admin-panel/reset-password?token=${token}">Reset Password</a>
                <p>This link will expire in a half hour.</p>
                `,
        }
        await transporter.sendMail(mailOption)
        res.status(200).json({message:"Reset password link sent to your email"})
    } catch (err) {
        console.error(err)
        res.status(500).json({message:"Server error"})
    }
}

//RESET PASSWORD
const resetPassword = async(req,res) => {
    const {new_password, token} = req.body
    try {
        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: {[sequelize.Op.gt]: new Date()}
            }
        })
        if(!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10)
        user.password_hash = hashedPassword
        user.reset_password_token = null
        user.reset_password_expires = null
        await user.save()
        res.status(200).json({message:"Password has been reset successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({message:"Server Error"})
    }
}


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    registerPengelola
}