const {Wisata, Transaksi, GaleriWisata, TransaksiDetail, sequelize, Pengelola} = require('../models')

//GET LIST WISATA
const getListWisata = async (req, res) => {
    try {
        const wisata = await Wisata.findAll()

        const baseURL = `${req.protocol}://${req.get('host')}`

        const formattedWisata = wisata.map(w => {
            return {
                ...w.toJSON(),
                url_gambar_utama: `${baseURL}/${w.url_gambar_utama.replace(/\\/g, '/').replace('public/', '')}`
            }
        })

        res.status(200).json({
            message:"Data wisata berhasil diambil",
            data: formattedWisata
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET WISATA BERDASARKAN ID WISATA
const getWisataDetail = async (req, res) => {
    const id = req.params.id
    try {
        const wisata = await Wisata.findOne({ where: {id_wisata: id} })
        if (!wisata) {
            res.status(404).json({message:"Wisata no existe"})
        }
        const pengelola = await Pengelola.findOne({where: {id_pengelola: wisata.id_pengelola}})
        if (!pengelola) {
            res.status(404).json({message:"Pengelola no existed"})
        }
        const baseURL = `${req.protocol}://${req.get('host')}`
        const  formattedPengelola = {
            ...pengelola.toJSON(),
            qr_code: `${baseURL}/${pengelola.qr_code.replace(/\\/g, '/').replace('public/', '')}`,
        }
        const galeriWisata = await GaleriWisata.findAll({where : {id_wisata: id}})
        res.status(200).json({
            message:"Data wisata berhasil diambil",
            data: wisata,
            qr_code: formattedPengelola.qr_code,
            gallery: galeriWisata
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//SHOW QR CODE FROM PENGELOLA
const getQrCodeWisata = async (req, res) => {
    const wisataId = req.params.id
    if (!wisataId) {
        res.status(404).json({message:"Wisata no existed"})
    }
    if (req.user.id_role !== 'USR') {
        res.status(401).json({message:"Anda harus seorang user!"})
    }
    try {
        const wisata = await Wisata.findOne({where: {id_wisata: wisataId}})
        if (!wisata) {
            res.status(404).json({message:"Wisata no existed"})
        }
        const pengelola = await Pengelola.findOne({where: {id_pengelola: wisata.id_pengelola}})
        if (!pengelola) {
            res.status(404).json({message:"Pengelola no existed"})
        }
        const baseURL = `${req.protocol}://${req.get('host')}`
        const  formattedPengelola = {
            ...pengelola.toJSON(),
            qr_code: `${baseURL}/${pengelola.qr_code.replace(/\\/g, '/').replace('public/', '')}`,
        }
        res.status(200).json({
            message:"Qr code berhasil diambil dari pengelola",
            qr_code: formattedPengelola.qr_code,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//BELI TIKET
//TODO: Belum di cek fungsi nya + belum for each untuk transaksi detail
const buyTicketWisata = async (req, res) => {
    const { body, file, params, user } = req;
    const { id: wisataId } = params
    const { id_user: userId } = user
    const { nama_pengirim, tanggal_kunjung } = body
    let tiket_details = body.tiket_details
    const buktiBayar = file ? file.path : null

    if (!wisataId) return res.status(404).json({ message: "Wisata ID tidak ditemukan." })
    if (!userId) return res.status(401).json({ message: "Kamu belum login." })
    if (!buktiBayar) return res.status(400).json({ message: "Tolong unggah bukti bayar terlebih dahulu." })

    if (typeof tiket_details === 'string') {
        try {
            tiket_details = JSON.parse(tiket_details)
        } catch (e) {
            return res.status(400).json({ message: "Format tiket_details tidak valid." })
        }
    }
    if (!tiket_details || !Array.isArray(tiket_details) || tiket_details.length === 0) {
        return res.status(400).json({ message: "Jumlah tiket atau detail tiket tidak valid." })
    }

    const t = await sequelize.transaction()

    try {
        const wisata = await Wisata.findOne({where: {id_wisata: wisataId}})
        const transaksi = await Transaksi.create({
            id_user: userId,
            id_wisata: wisataId,
            nama_pengirim: nama_pengirim,
            tanggal_kunjung: tanggal_kunjung,
            status: 'Pending',
            bukti_pembayaran: buktiBayar
        }, {transaction: t})

        const transaksiDetails = []
        for (const detail of tiket_details) {
            const newDetail = await TransaksiDetail.create({
                id_transaksi: transaksi.id_transaksi,
                gender: detail.gender,
                umur: detail.umur,
                harga: detail.harga
            }, {transaction: t})
            transaksiDetails.push(newDetail)
        }

        const jumlahTiket = transaksiDetails.length
        const hargaTiket = wisata.harga_tiket
        transaksi.total_bayar = jumlahTiket * hargaTiket
        transaksi.jumlah_tiket = jumlahTiket

        await t.commit()

        res.status(200).json({
            message: "Pembelian tiket serta informasi pembayaran sudah dikirim ke pihak yang bertanggung jawab",
            transaksi: transaksi,
            transaksiDetails: transaksiDetails
        });

    } catch (err) {
        await t.rollback()
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
    }
};

module.exports = {
    getListWisata,
    getWisataDetail,
    buyTicketWisata,
    getQrCodeWisata
}