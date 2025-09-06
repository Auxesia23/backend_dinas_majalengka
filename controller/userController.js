const { User, Wisata, Transaksi, TransaksiDetail} = require('../models')
const {Transaction} = require("sequelize")
const QRCode = require('qrcode')
const PDFDocument = require('pdfkit')
const axios = require('axios')
const ticketMaker = require('../helper/ticketMaker')

//PROTECTED
const getProtected = async(req, res) => {
    try {
        const id_user = req.user.id_user
        const data = await User.findOne({where: {id_user: id_user}})
        res.status(200).json({
            message:"Your data",
            data: data
        })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//READ all USER
const getAllUser = async(req,res) => {
    if(req.user.id_roles !== 'adm_wisata') {
        return res.status(403).json({message:"Role tidak Valid"})
    }
    try {
        const user = await User.findAll()
        res.json({
            message:"Success fetch data",
            data: user
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET History ALL Transaction for USER Specific
const getHistoryTransactions = async(req, res) => {
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(404).json({message:"User not found"})
    }
    try {
        const transactions = await Transaksi.findAll({
            where: {id_user: idUser},
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        res.status(200).json({
            message:"Berhasil mengambil data histori transaksi",
            transactions: transactions
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET Detail History Specific
const getDetailTransactions = async(req,res) => {
    const idUser = req.user.id_user
    const idTransaksi = req.params.id
    const idRole = req.user.id_role
    if (!idUser) {
        return res.status(403).json({message:"User not found"})
    }
    if (idRole !== 'USR') {
        return res.status(401).json({message:"You are not User"})
    }
    try {
        const transaksi = await Transaksi.findOne({
            where: {id_transaksi: idTransaksi},
            order: [
                ['createdAt', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        const detailTransaksi = await TransaksiDetail.findAll({where: {id_transaksi: idTransaksi}})
        res.status(200).json({
            message:"Berhasil mengambil detail",
            transaksi: transaksi,
            detailTransaksi: detailTransaksi
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

// GET TICKET FOR TRANSACTION
const getTicketDetails = async(req, res) => {
    const idTransaksi = req.params.id
    if (!idTransaksi) {
        return res.status(400).json({message:"Wisata not found"})
    }
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(400).json({message:"User not found"})
    }
    const idRole = req.user.id_role
    if (idRole !== 'USR') {
        return res.status(403).json({message:"You are not User"})
    }
    try {
        const transaksi = await Transaksi.findOne({
            where: {id_transaksi: idTransaksi},
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        if (!transaksi) {
            return res.status(404).json({message:"Transaksi not found"})
        }
        const userEmail = transaksi.User.email
        const detailTransaksi = await TransaksiDetail.findAll({where: {id_transaksi: transaksi.id_transaksi}})

        const baseUrl = `${req.protocol}s://${req.get('host')}`

        const formattedDetails = await Promise.all(detailTransaksi.map(async (detail) => {
            const qrCodeUrl = `${baseUrl}/scan/${detail.id_transaksi}/${detail.id_tiket}`
            const qrCodeBase64 = await QRCode.toDataURL(qrCodeUrl)
            return {
                id_tiket: detail.id_tiket,
                id_transaksi: detail.id_transaksi,
                email_pembeli: userEmail,
                harga: detail.harga,
                gender: detail.gender,
                umur: detail.umur,
                qr_code_base64: qrCodeBase64
            }
        }))

        const doc = new PDFDocument({
            size: 'A4',
            margin: 30
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=tickets-${transaksi.id_transaksi}.pdf`)
        doc.pipe(res)

        const ticketsPerPage = 3
        let ticketCount = 0

        for (const ticket of formattedDetails) {
            if (ticketCount > 0 && ticketCount % ticketsPerPage === 0) {
                doc.addPage()
            }
            ticketMaker.drawTicket(doc, ticket, ticketCount % ticketsPerPage)
            ticketCount++
        }

        doc.end()
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", err: err.message })
    }
}

module.exports = {
    getProtected,
    getAllUser,
    getHistoryTransactions,
    getDetailTransactions,
    getTicketDetails,
}