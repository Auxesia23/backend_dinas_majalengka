const {Pengelola, User, MessageApprovement, Transaksi, sequelize, Wisata, TransaksiDetail} = require('../models')
const transporter = require('../helper/email')
const qrisDinamis = require('@agungjsp/qris-dinamis')
const QRCode = require('qrcode')
const {Jimp} = require('jimp')
const jsQR = require('jsqr')
const path = require('path')
const fs = require('fs')
const ExcelJS = require('exceljs')
const { Op } = require('sequelize')

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
        if (pengelola.length === 0) {return res.status(404).json({ message: "Tidak ada pengelola satupun" }) }
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
        if (!pengelola) {return res.status(404).json({ message: "Tidak ada Pengelola pada ID tersebut" }) }
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
        if (!pengelola) {return res.status(404).json({ message: "Pengelola tidak cocok dengan User" }) }
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
            return res.status(404).json({message: "Tidak ada Top 3 data wisata populer!"})
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

//GET ALL WISATA REVENUE
const getAllWisataRevenue = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {
        return res.status(403).json({ message: "Anda bukan Dinas" })
    }
    try {
        const result = await Transaksi.findAll({
            attributes: [
                'id_wisata',
                [sequelize.fn('sum', sequelize.col('total_bayar')), 'total_keuntungan'],
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'jumlah_tiket'],
            ],
            where: { status: 'Terkonfirmasi' },
            group: ['id_wisata'],
            order: [[sequelize.literal('total_keuntungan'), 'DESC']],
            include: [{
                model: Wisata,
                attributes: ['nama_wisata', 'lokasi', 'averageRating'],
                include: [{
                    model: Pengelola,
                    attributes: ['id_pengelola'],
                    include: [{
                        model: User,
                        attributes: ['nama_lengkap'],
                    }]
                }]
            }]
        })
        if (result.length === 0) {
            return res.status(404).json({ message: "Tidak ada total transaksi semua wisata yang ditemukan!" })
        }
        const formattedResult = result.map(transaksi => ({
            nama_wisata: transaksi.Wisatum.nama_wisata,
            nama_pengelola_wisata: transaksi.Wisatum.Pengelola.User.nama_lengkap,
            lokasi: transaksi.Wisatum.lokasi,
            rating: transaksi.Wisatum.averageRating,
            total_penjualan_tiket: transaksi.dataValues.total_keuntungan,
            jumlah_tiket: transaksi.dataValues.jumlah_tiket,
        }))
        res.status(200).json({
            message: "Data total penjualan wisata berhasil didapatkan!",
            data: formattedResult
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//SHOW QR DYNAMIC FOR VALIDATION
async function readQRCode(imagePath) {
    try {
        const baseDir = path.join(__dirname, '..')
        const finalPath = path.join(baseDir, imagePath.replace(/\\/g, '/'))
        if (!fs.existsSync(finalPath)) {
            console.error('File not found at:', finalPath);
            return null; // Return null jika file tidak ditemukan
        }

        const imageBuffer = fs.readFileSync(finalPath)
        const image = await Jimp.read(imageBuffer)
        const { data, width, height } = image.bitmap
        const code = jsQR(new Uint8ClampedArray(data), width, height)
        console.log(finalPath)
        if (code) {
            console.log("QR code berhasil dibaca: " + code.data)
            return code.data
        } else {
            console.log("Tidak ada QR code ditemukan di gambar.");
            return null;
        }
    } catch (err) {
        console.error('Error in readQRCode', err)
        return null
    }
}
const getQrCodeValidation = async (req, res) => {
    const idPengelola = req.params.id
    if (!idPengelola) {return res.status(404).json({ message: "Id Pengelola tidak valid!" }) }
    const idRole = req.user.id_role
    if (idRole !== 'DNS') {return res.status(403).json({ message: "Only Dinas can validate!" }) }
    try {
        const pengelola = await Pengelola.findOne({
            where: { id_pengelola: idPengelola }
        })
        if (!pengelola) { return res.status(404).json({ message: "Pengelola tidak valid!" }) }

        const qrData = await readQRCode(pengelola.qr_code)
        if (!qrData) {return res.status(404).json({message:"Invalid QR Code, Please try again!"}) }

        const testPrice = 100
        const result = qrisDinamis.makeString(qrData, {nominal: testPrice.toString()})
        QRCode.toDataURL(result, function (err, url) {
            if (err) return res.status(404).json({message:"Error getting QR Code!"})
            return res.status(200).json({
                message: "Berhasil mendapatkan QR Dinamis, please check it with your phone!",
                base64QR: url
            })
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server Error!", error: e.message })
    }
}

const getMonthlyRevenue = async (req, res) => {
    const { year, month } = req.params
    const idRole = req.user.id_role
    if (idRole !== 'DNS') { return res.status(403).json({ message: "Only Dinas can validate!" }) }
    try {
        if (!year || !month) {
            return res.status(400).json({message:"Mohon isi tahun dan bulan!"})
        }

        const transaction = await Transaksi.findAll({
            where: {
                status: 'Terkonfirmasi',
                createdAt: {
                    [Op.gte]: new Date(year, month - 1, 1),
                    [Op.lt]: new Date(year, month, 1),
                }
            },
            attributes: [
                'id_wisata',
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'total_tiket'],
                [sequelize.fn('sum', sequelize.col('total_bayar')), 'total_penjualan']
            ],
            group: ['id_wisata']
        })

        const detailTransaksi = await TransaksiDetail.findAll({
            where: {
                createdAt: {
                    [Op.gte]: new Date(year, month - 1, 1),
                    [Op.lt]: new Date(year, month, 1),
                }
            },
            attributes: [
                [sequelize.col('Transaksi.id_wisata'), 'id_wisata'],
                [sequelize.fn('sum', sequelize.literal('CASE WHEN `TransaksiDetail`.`gender` = "L" THEN 1 ELSE 0 END')), 'jumlah_tiket_laki'],
                [sequelize.fn('sum', sequelize.literal('CASE WHEN `TransaksiDetail`.`gender` = "P" THEN 1 ELSE 0 END')), 'jumlah_tiket_perempuan']
            ],
            include: [{
                model: Transaksi,
                attributes: [],
                where: { status: 'Terkonfirmasi' }
            }],
            group: ['id_wisata'],
            raw: true
        })

        const reportData = []
        let no = 1
        for (const trans of transaction) {
            const wisata = await Wisata.findOne({ where: {id_wisata: trans.id_wisata} })
            const detail = detailTransaksi.find(d => d.id_wisata === trans.id_wisata)

            reportData.push({
                no: no++,
                nama_wisata: wisata ? wisata.nama_wisata : 'Unknown',
                jumlah_tiket_laki: parseInt(detail ? detail.jumlah_tiket_laki : 0),
                jumlah_tiket_perempuan: parseInt(detail ? detail.jumlah_tiket_perempuan : 0),
                total_tiket: parseInt(trans.dataValues.total_tiket, 10),
                total_penjualan: parseFloat(trans.dataValues.total_penjualan)
            })
        }

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(`Laporan Penjualan Bulan ${year}-${month}`)

        worksheet.addRow([`Laporan Penjualan Bulan ${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric'})}`])
        worksheet.mergeCells('A1:F1')
        worksheet.getCell('A1').font = { size: 16, bold: true }
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }

        worksheet.addRow(['No', 'Nama Wisata', 'Jumlah Tiket Laki-laki', 'Jumlah Tiket Perempuan', 'Total Tiket', 'Total Penjualan'])
        worksheet.getRow(2).font = {bold: true}

        reportData.forEach(row => {
            worksheet.addRow([
                row.no,
                row.nama_wisata,
                row.jumlah_tiket_laki,
                row.jumlah_tiket_perempuan,
                row.total_tiket,
                row.total_penjualan
            ])
        })

        worksheet.getColumn(6).numFmt = '"Rp"#,##0.00'

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Penjualan_${year}-${month}.xlsx`)

        await workbook.xlsx.write(res)
        res.end()
    } catch (e) {
        console.error(e)
        return res.status(500).json({message:"Error getting monthly revenue!", error: e.message})
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
    getTopRevenueWisata,
    getAllWisataRevenue,
    getQrCodeValidation,
    getMonthlyRevenue
}