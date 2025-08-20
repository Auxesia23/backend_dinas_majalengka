const { User, Wisata, Transaksi, TransaksiDetail} = require('../models')
const {Transaction} = require("sequelize");

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
        return res.status(403).json({message:"User not found"})
    }
    try {
        const transactions = await Transaksi.findAll({where: {id_user: idUser}})
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
        const transaksi = await Transaksi.findOne({where: {id_transaksi: idTransaksi}})
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

module.exports = {
    getProtected,
    getAllUser,
    getHistoryTransactions,
    getDetailTransactions,
}