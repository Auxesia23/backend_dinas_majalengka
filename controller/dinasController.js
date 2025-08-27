const {Pengelola, User, MessageApprovement} = require('../models')
const transporter = require('../helper/email')

//GET ALL PENGELOLA
const getAllPengelola = async (req, res) => {
    const role = req.user.id_role
    if (role !== 'DNS') {
        return res.status(403).json({ message: "You are not authorized to DNS" })
    }
    try {
        const pengelola = await Pengelola.findAll({
            attributes: ['id_pengelola', 'tahun_operasi', 'createdAt', 'is_approved'],
            order: [
                ['createdAt', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        res.status(200).json({
            message: "Data berhasil didapatkan",
            data: pengelola
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET DETAIL PENGELOLA
const getDetailPengelola = async (req, res) => {
    const role = req.user.id_role
    if (role !== 'DNS') {
        return res.status(403).json({ message: "You are not authorized to DNS" })
    }
    const idPengelola = req.params.id
    try {
        const pengelola = await Pengelola.findOne({
            where: {id_pengelola: idPengelola},
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        const baseURL = `${req.protocol}://${req.get('host')}`
        const formattedPengelola = {
            ...pengelola.toJSON(),
            url_ktp: `${baseURL}/${pengelola.url_ktp.replace(/\\/g, '/').replace('public/', '')}`,
            url_npwp: `${baseURL}/${pengelola.url_npwp.replace(/\\/g, '/').replace('public/', '')}`,
            url_nib: `${baseURL}/${pengelola.url_nib.replace(/\\/g, '/').replace('public/', '')}`,
            qr_code: `${baseURL}/${pengelola.qr_code.replace(/\\/g, '/').replace('public/', '')}`
        }
        res.status(200).json({
            message: "Data berhasil didapatkan",
            data: formattedPengelola
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//APPROVE PENGELOLA
const approvePengelola = async (req,res) => {
    const idPengelola = req.params.id
    const status = req.body.status
    const pesan = req.body.pesan
    if (!idPengelola) {
        return res.status(400).json({ message: "ID Pengelola tidak ada" })
    }
    const role = req.user.id_role
    if (role !== 'DNS') {
        return res.status(403).json({ message: "You are not authorized to DNS" })
    }
    try {
        const pengelola = await Pengelola.findOne({
            where: {id_pengelola: idPengelola},
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        switch (status) {
            case 'Disetujui':
                pengelola.is_approved = status
                break
            case 'Ditolak':
                pengelola.is_approved = status
                break
            default:
                return res.status(403).json({ message: "Status tidak ditemukan" })
        }
        await pengelola.save()
        await MessageApprovement.create({
            idPengelola: idPengelola,
            pesan: pesan
        })

        const recipientEmail = pengelola.User.email
        const recipientName = pengelola.User.nama_lengkap

        let emailSubject = ''
        let emailHtml = ''

        if (status === 'Disetujui') {
            emailSubject = 'Persetujuan Akun Pengelola Anda'
            emailHtml = `
                <h3>Halo, ${recipientName},</h3>
                <p>Akun Pengelola Anda telah **Disetujui** oleh Dinas Pariwisata Majalengka</p>
                <p>Sekarang Anda dapat login dan mengelola data wisata Anda</p>
                <p>Pesan dari Dinas: ${pesan}</p>
                <p>Terima Kasih.</p>
            `
        } else if (status === 'Ditolak') {
            emailSubject = 'Penolakan Akun Pengelola Anda'
            emailHtml = `
                <h3>Halo, ${recipientName},</h3>
                <p>Akun Pengelola Anda telah **Ditolak** oleh Dinas Pariwisata Majalengka</p>
                <p>Mohon periksa kembali data yang Anda berikan</p>
                <p>Pesan dari Dinas: ${pesan}</p>
                <p>Terima Kasih.</p>
            `
        }

        const mailOptions = {
            from: 'Admin@relawanmate.site',
            to: recipientEmail,
            subject: emailSubject,
            html: emailHtml
        }

        await transporter.sendMail(mailOptions)

        res.status(200).json({
            message: `Status pengelola ${idPengelola} berhasil diubah ke ${status} dengan pesan ${pesan}`
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = {
    getAllPengelola,
    getDetailPengelola,
    approvePengelola
}