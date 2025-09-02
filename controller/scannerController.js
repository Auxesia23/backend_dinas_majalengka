const {Scanner, TransaksiDetail} = require('../models')

// UPDATE STATUS OF TICKET DETAIL TRANSACTION
const scanTicket = async (req, res) => {
    const idTransaction = req.params.idTransaction
    if (!idTransaction) {
        return res.status(400).send({message:'Invalid Transaction ID!'})
    }
    const idTicket = req.params.idTicket
    if (!idTicket) {
        return res.status(400).send({message:'Invalid Ticket ID!'})
    }
    const idRole = req.user.id_role
    if (idRole !== 'SCNR') {
        return res.status(403).send({message:'You are not a scanner!'})
    }
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(400).send({message:'User not found!'})
    }
    try {
        const userScanner = await Scanner.findOne({ where:{id_user: idUser} })
        if (!userScanner) { return res.status(404).send({message:'No User Scanner found!'}) }
        const transaksiDetail = await TransaksiDetail.findOne({
            where: {
                id_transaksi: idTransaction,
                id_tiket: idTicket
            }
        })
        if (!transaksiDetail) {
            return res.status(404).send({message:'No Tiket found!'})
        }
        if (transaksiDetail.isScanned === false) {
            transaksiDetail.isScanned = true
        } else {
            return res.status(200).send({message:'Already Scanned!'})
        }
        await transaksiDetail.save()
        res.status(200).send({message:'Scanned Successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Something went wrong!', error:err.message})
    }
}

module.exports = {
    scanTicket,
}