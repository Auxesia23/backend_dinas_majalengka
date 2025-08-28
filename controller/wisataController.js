const {Wisata, Transaksi, GaleriWisata, TransaksiDetail, sequelize, Pengelola, Rating, User} = require('../models')

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

//GET MOST POPULAR WISATA BY TICKETS
const getMostPopularByTickets = async (req, res) => {
    try {
        const popularWisata = await Transaksi.findAll({
            attributes: [
                'id_wisata',
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'total_tickets']
            ],
            group: ['id_wisata'],
            order: [[sequelize.literal('total_tickets'), 'DESC']],
            limit: 1
        })
        if (popularWisata.length === 0) {
            return res.status(404).json({ message: "Tidak ada data transaksi yang ditemukan"})
        }
        const idWisata = popularWisata[0].id_wisata
        const wisata = await Wisata.findOne({
            where: {id_wisata: idWisata}
        })
        if (!wisata) {
            return res.status(404).json({ message: "Wisata tidak ditemukan" })
        }
        const galeriWisata = await GaleriWisata.findAll({
            where: {id_wisata: idWisata}
        })
        const baseURL = `${req.protocol}://${req.get('host')}`
        const formatedWisata = {
            ...wisata.toJSON(),
            url_gambar_utama: `${baseURL}/${wisata.url_gambar_utama.replace(/\\/g, '/').replace('public/', '')}`
        }
        const formattedGaleriWisata = galeriWisata.map(galeri => ({
            ...galeri.toJSON(),
            url_gambar: `${baseURL}/${galeri.url_gambar.replace(/\\/g, '/').replace('public/', '')}`
        }))

        res.status(200).json({
            message: `Wisata paling populer berdasarkan jumlah tiket (${popularWisata[0].dataValues.total_tickets} tiket) berhasil diambil.`,
            data: formatedWisata,
            gallery: formattedGaleriWisata
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

//GET WISATA BERDASARKAN ID WISATA
const getWisataDetail = async (req, res) => {
    const id = req.params.id
    try {
        const wisata = await Wisata.findOne({ where: {id_wisata: id} })
        if (!wisata) {
            return res.status(404).json({message:"Wisata no existe"})
        }
        const pengelola = await Pengelola.findOne({where: {id_pengelola: wisata.id_pengelola}})
        if (!pengelola) {
            return res.status(404).json({message:"Pengelola no existed"})
        }
        const baseURL = `${req.protocol}://${req.get('host')}`
        const formattedWisata = {
            ...wisata.toJSON(),
            url_gambar_utama: `${baseURL}/${wisata.url_gambar_utama.replace(/\\/g, '/').replace('public/', '')}`,
        }
        const formattedPengelola = {
            ...pengelola.toJSON(),
            qr_code: `${baseURL}/${pengelola.qr_code.replace(/\\/g, '/').replace('public/', '')}`,
        }
        const galeriWisata = await GaleriWisata.findAll({where : {id_wisata: id}})
        const formattedGaleriWisata = galeriWisata.map(galeri => ({
            ...galeri.toJSON(),
            url_gambar: `${baseURL}/${galeri.url_gambar.replace(/\\/g, '/').replace('public/', '')}`
        }))
        const ratings = await Rating.findAll({
            where: {wisataId: id},
            include: [{
                model: User,
                attributes: ['nama_lengkap']
            }]
        })
        res.status(200).json({
            message:"Data wisata berhasil diambil",
            data: formattedWisata,
            qr_code: formattedPengelola.qr_code,
            gallery: formattedGaleriWisata,
            ratings: ratings
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
        return res.status(404).json({message:"Wisata no existed"})
    }
    if (req.user.id_role !== 'USR') {
        return res.status(401).json({message:"Anda harus seorang user!"})
    }
    try {
        const wisata = await Wisata.findOne({where: {id_wisata: wisataId}})
        if (!wisata) {
            return res.status(404).json({message:"Wisata no existed"})
        }
        const pengelola = await Pengelola.findOne({where: {id_pengelola: wisata.id_pengelola}})
        if (!pengelola) {
            return res.status(404).json({message:"Pengelola no existed"})
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
                harga: wisata.harga_tiket
            }, {transaction: t})
            transaksiDetails.push(newDetail)
        }

        const jumlahTiket = transaksiDetails.length
        const hargaTiket = wisata.harga_tiket
        transaksi.total_bayar = jumlahTiket * hargaTiket
        transaksi.jumlah_tiket = jumlahTiket

        await transaksi.save({transaction: t})

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
}

const buyTicketBundle = async (req, res) => {
    const { body, file, params, user } = req
    const { id: wisataId } = params
    const { id_user: userId } = user
    const { nama_pengirim, tanggal_kunjung, deskripsi } = body
    let bundle_details = body.bundle_details
    const buktiBayar = file ? file.path : null

    if (!wisataId) return res.status(404).json({ message: "Wisata ID tidak ditemukan." })
    if (!userId) return res.status(401).json({ message: "Kamu belum login." })
    if (!buktiBayar) return res.status(400).json({ message: "Tolong unggah bukti bayar terlebih dahulu." })

    if (typeof bundle_details === 'string') {
        try {
            bundle_details = JSON.parse(bundle_details)
        } catch (e) {
            return res.status(400).json({ message: "Format bundle_details tidak valid." })
        }
    }
    if (!bundle_details || !Array.isArray(bundle_details) || bundle_details.length === 0) {
        return res.status(400).json({ message: "Detail Bundle tidak valid." })
    }

    const t = await sequelize.transaction()
    
    try {
        const wisata = await Wisata.findOne({where: {id_wisata: wisataId}})
        if (!wisata) {
            await t.rollback()
            return res.status(404).json({ message: "Wisata ID tidak ditemukan." })
        }
        console.log("wisata berhasil")
        const transaksi = await Transaksi.create({
            id_user: userId,
            id_wisata: wisataId,
            nama_pengirim: nama_pengirim,
            tanggal_kunjung: tanggal_kunjung,
            status: 'Pending',
            bukti_pembayaran: buktiBayar,
            deskripsi: deskripsi
        }, {transaction: t})

        const transaksiDetails = []
        let totalJumlahTiket = 0

        for (const bundle of bundle_details) {
            const {umur, 'L': lakilaki, 'P': perempuan} = bundle
            // Laki-Laki
            for (let i = 0; i < lakilaki; i++) {
                const newDetail = await TransaksiDetail.create({
                    id_transaksi: transaksi.id_transaksi,
                    gender: 'L',
                    umur: umur,
                    harga: wisata.harga_tiket,
                }, {transaction: t})
                transaksiDetails.push(newDetail)
                totalJumlahTiket++
            }
            // Perempuan
            for (let i = 0; i < perempuan; i++) {
                const newDetail = await TransaksiDetail.create({
                    id_transaksi: transaksi.id_transaksi,
                    gender: 'P',
                    umur: umur,
                    harga: wisata.harga_tiket,
                }, {transaction: t})
                transaksiDetails.push(newDetail)
                totalJumlahTiket++
            }
        }

        transaksi.total_bayar = totalJumlahTiket * wisata.harga_tiket
        transaksi.jumlah_tiket = totalJumlahTiket

        await transaksi.save({transaction: t})
        await t.commit()

        res.status(200).json({
            message: "Pembelian tiket bundle berhasil. Informasi pembayaran sudah dikirim.",
            transaksi: transaksi,
            transaksiDetails: transaksiDetails
        })
    } catch (err) {
        await t.rollback()
        console.error(err)
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message })
    }
}

const addRating = async (req, res) => {
    const idWisata = req.params.id
    const rating = req.body.rating
    const comment = req.body.comment
    const userRole = req.user.id_role
    const idUser = req.user.id_user
    if (userRole !== 'USR') {
        return res.status(403).json({ message: "Hanya user saja yang boleh rating!" })
    }
    if (!idWisata) {
        return res.status(404).json({ message: "Wisata ID tidak valid!" })
    }
    if (!rating) {
        return res.status(400).json({ message: "Mohon isi rating dengan benar!" })
    }
    if (!comment) {
        return res.status(400).json({ message: "Mohon isi comment dengan benar!" })
    }
    try {
        const hasPurchasedTicket = await Transaksi.findOne({
            where: {
                id_user: idUser,
                id_wisata: idWisata,
                status: 'Terkonfirmasi',
            }
        })
        if (!hasPurchasedTicket) {
            return res.status(403).json({ message: "Anda harus membeli tiket wisata ini terlebih dahulu sebelum memberikan rating." })
        }
        const existingRating = await Rating.findOne({
            where: {wisataId: idWisata, userId: idUser}
        })
        if (existingRating) {
            return res.status(400).json({ message: "Anda sudah memberikan rating untuk wisata ini."})
        }
        const newRating = await Rating.create({
            wisataId: idWisata,
            userId: idUser,
            rating: rating,
            comment: comment
        })
        const allRatingsforWisata = await Rating.findAll({
            where: {wisataId: idWisata}
        })
        const totalRating = allRatingsforWisata.reduce((sum, r) => sum + r.rating, 0)
        const averageRating = totalRating / allRatingsforWisata.length

        await Wisata.update({
            averageRating: averageRating
        }, {
            where: {id_wisata: idWisata}
        })
        return res.status(201).json({message: "Rating berhasil ditambahkan", rating: newRating})
    }catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message })
    }
}

module.exports = {
    getListWisata,
    getMostPopularByTickets,
    getWisataDetail,
    buyTicketWisata,
    getQrCodeWisata,
    buyTicketBundle,
    addRating
}