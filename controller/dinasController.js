const {Pengelola, User, MessageApprovement, Transaksi, sequelize, Wisata} = require('../models')
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

//GET ALL WISATA TOTAL
const getTotalWisata = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas" })
    }
    try {
        const totalWisata = await Wisata.count()
        res.status(200).json({
            message: "Total jumlah wisata berhasil diambil!",
            totalWisata: totalWisata
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//GET ALL ACCOUNT OF WISATA
const getApprovedPengelolaCount = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas" })
    }
    try {
        const approvedPengelola = await Pengelola.count({
            where: { is_approved: 'Disetujui' },
        })
        res.status(200).json({
            message: "Jumlah pengelola yang disetujui berhasil didapatkan!",
            approvedPengelolaCount: approvedPengelola
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//GET TOTAL PENGUNJUNG ALL WISATA
const getTotalVisitor = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas" })
    }
    try {
        const result = await Transaksi.findOne({
            attributes: [
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'total_pengunjung'],
            ],
            where: { status: 'Terkonfirmasi' }
        })
        const totalVisitor = result.dataValues.total_pengunjung || 0
        res.status(200).json({
            message: "Total pengunjung dari semua wisata berhasil didapatkan!",
            totalVisitors: totalVisitor
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//GET TOTAL MONEY BY ALL WISATA
const getTotalRevenue = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas harap kembali!" })
    }
    try {
        const result = await Transaksi.findOne({
            attributes: [
                [sequelize.fn('sum', sequelize.col('total_bayar')), 'total_revenue']
            ],
            where: { status: 'Terkonfirmasi' }
        })
        const totalRevenue = result.dataValues.total_revenue || 0
        res.status(200).json({
            message: 'Total keuntungan dari semua wisata berhasil didapatkan!',
            totalRevenue: totalRevenue
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//GET WISATA KEUNTUNGAN 3 TERATAS
const getTopRevenueWisata = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas" })
    }
    try {
        const topWisata = await Transaksi.findAll({
            attributes: [
                'id_wisata',
                [sequelize.fn('sum', sequelize.col('total_bayar')), 'total_keuntungan'],
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'jumlah_tiket']
            ],
            where: { status: 'Terkonfirmasi' },
            group: ['id_wisata'],
            order: [[sequelize.literal('total_keuntungan'), 'DESC']],
            limit: 3,
            include: [{
                model: Wisata,
                attributes: ['nama_wisata', 'lokasi'],
            }]
        })
        if (topWisata.length === 0) {
            return res.status(404).json({message: "Tidak ada data transaksi yang ditemukan"})
        }
        const formattedResult = topWisata.map(wisata => ({
            nama_wisata: wisata.Wisatum.nama_wisata,
            lokasi: wisata.Wisatum.lokasi,
            total_penjualan_tiket: wisata.dataValues.total_keuntungan,
            jumlah_tiket: wisata.dataValues.jumlah_tiket
        }))
        res.status(200).json({
            message: "Data Wisata teratas berdasarkan keuntungan berhasil didapatkan!",
            data: formattedResult
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

module.exports = {
    getAllPengelola,
    getDetailPengelola,
    approvePengelola,
    getTotalWisata,
    getApprovedPengelolaCount,
    getTotalVisitor,
    getTotalRevenue,
    getTopRevenueWisata
}