const {Pengelola, Wisata, GaleriWisata, Transaksi, TransaksiDetail, User, sequelize} = require('../models')
const idGenerator = require('../helper/userIdGenerator')
const path = require('path')
const fs = require("node:fs");

//REGISTER WISATA
const registerWisata = async (req, res) => {
    const body = req.body
    const filesGambar = req.files 
    const wisataImages = filesGambar.wisataImages
    const wisataImage = filesGambar.wisataImage
    if(req.user.id_role !== 'PNGL') {
        return res.status(401).json({message:"Lu bukan Pengelola"})
    }
    if(!wisataImages || wisataImages.length === 0) {
        return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' })
    }
    try {
        const userId = req.user.id_user
        const pengelola = await Pengelola.findOne({where: {id_user: userId}})
        if (!pengelola) {
            return res.status(404).json({ message: "Data pengelola tidak ditemukan." });
        }
        const existingWisata = await Wisata.findOne({ where: { id_pengelola: pengelola.id_pengelola } });
        if (existingWisata) {
            return res.status(400).json({ message: "Pengelola ini sudah mendaftarkan satu tempat wisata." });
        }
        const newWisataId = await idGenerator.generateWisataId()
        const wisata = await Wisata.create({
            id_wisata:newWisataId,
            id_pengelola: pengelola.id_pengelola,
            nama_wisata: body.nama_wisata,
            deskripsi: body.deskripsi,
            lokasi: body.lokasi,
            jam_buka: body.jam_buka,
            jam_tutup: body.jam_tutup,
            jam_terbaik: body.jam_terbaik,
            hari_operasi: body.hari_operasi,
            locationGoogleMaps: body.locationGoogleMaps,
            fasilitas: body.fasilitas,
            asuransi: body.asuransi,
            harga_tiket: body.harga_tiket,
            url_gambar_utama: wisataImage[0].path
        })

        // FIXED: Hapus panggilan idGenerator.generateGaleriWisataId
        const galeriData = wisataImages.map(file => ({
            id_wisata: wisata.id_wisata,
            url_gambar: file.path
        }));
        
        await GaleriWisata.bulkCreate(galeriData)

        res.status(200).json({
            message:"Daftar Wisata Berhasil",
            data:wisata, 
            gambar_utama: `${wisataImage.length} gambar utama berhasil ditambahkan`,
            gambar_galeri: `${wisataImages.length} gambar berhasil ditambahkan ke galeri wisata`
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET WISATA BERDASARKAN PENGELOLA ID
const getWisata = async (req, res) => {
    const idUser = req.user.id_user
    if (!idUser) return res.status(401).json({ message: "Unauthorized!" })
    try {
        const pengelola = await Pengelola.findOne({where: {id_user: idUser}})
        if (!pengelola) {
            return res.status(404).json({ message: "Pengelola tidak ditemukan" });
        }
        const wisata = await Wisata.findOne({where:{id_pengelola: pengelola.id_pengelola}})
        const galeriWisata = await GaleriWisata.findAll({where: {id_wisata:wisata.id_wisata}})
        if (!wisata || !galeriWisata) {
            return res.status(200).json({message: "Belum ada wisata maupun galeri"})
        }

        const baseURL = `${req.protocol}://${req.get('host')}`

        // Ubah URL di data wisata
        const formattedWisata = {
            ...wisata.toJSON(),
            url_gambar_utama: `${baseURL}/${wisata.url_gambar_utama.replace(/\\/g, '/').replace('public/', '')}`
        }

        // Ubah URL di galeri wisata
        const formattedGaleri = galeriWisata.map(galeri => ({
            ...galeri.toJSON(),
            url_gambar: `${baseURL}/${galeri.url_gambar.replace(/\\/g, '/').replace('public/', '')}`
        }))

        res.status(200).json({
            message:"Data Wisata Berhasil diambil berdasarkan pengelola",
            data: formattedWisata,
            galeri: formattedGaleri
        })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//UPDATE WISATA DATA
const updateWisataData = async (req,res) => {
    const body = req.body
    const fileGambar = req.file
    try {
        if (req.user.id_role !== 'PNGL') {
            return res.status(401).json({ message: "Anda bukan pengelola" })
        }

        const userId = req.user.id_user
        const pengelola = await Pengelola.findOne({ where: { id_user: userId } })
        if (!pengelola) {
            return res.status(404).json({ message: "Pengelola tidak ditemukan" })
        }

        const wisata = await Wisata.findOne({ where: { id_pengelola: pengelola.id_pengelola} })
        if (!wisata) {
            return res.status(404).json({ message: "Wisata tidak ditemukan" })
        }

        if (body.nama_wisata) wisata.nama_wisata = body.nama_wisata
        if (body.deskripsi) wisata.deskripsi = body.deskripsi
        if (body.lokasi) wisata.lokasi = body.lokasi
        if (body.jam_buka) wisata.jam_buka = body.jam_buka
        if (body.jam_tutup) wisata.jam_tutup = body.jam_tutup
        if (body.jam_terbaik) wisata.jam_terbaik = body.jam_terbaik
        if (body.fasilitas) wisata.fasilitas = body.fasilitas
        if (body.asuransi) wisata.asuransi = body.asuransi
        if (body.harga_tiket) wisata.harga_tiket = body.harga_tiket
        if (body.hari_operasi) wisata.hari_operasi = body.hari_operasi
        if (body.locationGoogleMaps) wisata.locationGoogleMaps = body.locationGoogleMaps
        console.log(fileGambar)
        if (fileGambar) wisata.url_gambar_utama = fileGambar.path


        await wisata.save()
        res.status(200).json({message: "Data berhasil diupdate", data: wisata})
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//UDATE GAMBAR WISATA
const updateWisataGallery = async (req,res) => {
    const filesGambar = req.files || {}
    const wisataImages = filesGambar.wisataImages || []
    const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : []

    try {
        if (req.user.id_role !== 'PNGL') {
            return res.status(401).json({ message: "Anda bukan pengelola" })
        }

        const userId = req.user.id_user
        const pengelola = await Pengelola.findOne({ where: { id_user: userId } })
        if (!pengelola) {
            return res.status(404).json({ message: "Pengelola tidak ditemukan" })
        }

        const wisata = await Wisata.findOne({ where: { id_pengelola: pengelola.id_pengelola} })
        if (!wisata) {
            return res.status(404).json({ message: "Wisata tidak ditemukan" })
        }

        if (wisataImages.length > 0) {
            const galeriData = wisataImages.map(file => ({
                id_wisata: wisata.id_wisata,
                url_gambar: file.path,
            }))
            await GaleriWisata.bulkCreate(galeriData)
        }

        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
            const imagesToDeleteFromDB = await GaleriWisata.findAll({
                where: {
                    id_galery_wisata: imagesToDelete,
                    id_wisata: wisata.id_wisata
                }
            })

            imagesToDeleteFromDB.forEach(img => {
                const imagePath = path.join(__dirname, '..', img.url_gambar)
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            })

            await GaleriWisata.destroy({
                where: {id_galery_wisata: imagesToDelete}
            })
        }

        const updatedGaleri = await GaleriWisata.findAll({where : {id_wisata: wisata.id_wisata}})

        res.status(200).json({
            message: "Galeri Wisata berhasil di update",
            galeri: updatedGaleri
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//CHECK HISTORY TRANSAKSI BERDASARKAN WISATA SI PENGELOLA
const checkHistoryTransaction = async (req,res) => {
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(401).json({ message: "User ID tidak ditemukan" })
    }
    const roleUser = req.user.id_role
    if (roleUser !== 'PNGL') {
        return res.status(403).json({message:"Anda bukan pengelola! silahkan kembali"})
    }
    try {
        const pengelola = await Pengelola.findOne({where: {id_user: idUser} })
        const wisata = await Wisata.findOne({where: {id_pengelola: pengelola.id_pengelola}})
        const transaksi = await Transaksi.findAll({
            where: {id_wisata: wisata.id_wisata},
            order: [
                ['createdAt', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        res.status(200).json({
            message: "Data Transaksi berhasil didapatkan",
            transaksi: transaksi
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET DETAIL TRANSACTION
const checkDetailHistoryTransaction = async (req,res) => {
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(401).json({ message: "User ID tidak ditemukan" })
    }
    const roleUser = req.user.id_role
    if (roleUser !== 'PNGL') {
        return res.status(403).message({message:"Anda bukan pengelola! silahkan kembali"})
    }
    const transaksiId = req.params.id
    try {
        const transaksi = await Transaksi.findOne({
            where: {id_transaksi: transaksiId},
            order: [
                ['createdAt', 'DESC']
            ],
            include: [{
                model: User,
                attributes: ['nama_lengkap', 'email']
            }]
        })
        const detailtransaksi = await TransaksiDetail.findAll({where: {id_transaksi: transaksiId}})
        res.status(200).json({
            message: "Data Transaksi berhasil didapatkan",
            transaksi: transaksi,
            detailtransaksi: detailtransaksi
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//ENDPOINT UBAH STATUS TRANSAKSI
const updateStatusTransaction = async (req,res) => {
    const idTransaction = req.params.id
    const status = req.body.status
    if (!idTransaction) {
        return res.status(400).message({message:"ID Transaksi tidak ada"})
    }
    if (!status) {
        return res.status(400).message({message:"Status tidak ada"})
    }
    try {
        const transaction = await Transaksi.findOne({
            where: {id_transaksi: idTransaction}
        })
        if (status) {
            transaction.status = status
        }
        await transaction.save()
        res.status(200).json({
            message:`Status transaksi ke-${idTransaction} berhasil diubah`,
            transaction: transaction
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error" })
    }
}

//GET TOTAL PENJUALAN
const getTotalPenjualan = async (req, res) => {
    const idRole = req.user.id_role
    const idUser = req.user.id_user
    try {
        if (idRole !== 'PNGL') {
            return res.status(403).json({message:"Anda bukan pengelola"})
        }
        const pengelola = await Pengelola.findOne({where: {id_user: idUser}})
        if (!pengelola) {
            return res.status(400).json({message:"Data pengelola tidak ditemukan"})
        }
        const wisata = await Wisata.findOne({where: {id_pengelola: pengelola.id_pengelola}})
        if (!wisata) {
            return res.status(400).json({message:"Data Wisata tidak ditemukan"})
        }

        const result = await Transaksi.findOne({
            attributes: [
                [sequelize.fn('sum', sequelize.col('total_bayar')), 'total_penjualan']
            ],
            where: {
                id_wisata: wisata.id_wisata,
                status: 'Terkonfirmasi'
            }
        })

        const totalPenjualan = result.dataValues.total_penjualan || 0
        res.status(200).json({
            message:`Total penjualan berhasil didapatkan`,
            totalPenjualan: totalPenjualan
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
    }
}

const getTotalVisitor = async (req, res) => {
    const idRole = req.user.id_role
    const idUser = req.user.id_user
    try {
        if (idRole !== 'PNGL') {
            return res.status(403).json({message:"Anda bukan pengelola"})
        }
        const pengelola = await Pengelola.findOne({where: {id_user: idUser}})
        if (!pengelola) {
            return res.status(400).json({message:"Data pengelola tidak ditemukan"})
        }
        const wisata = await Wisata.findOne({where: {id_pengelola: pengelola.id_pengelola}})
        if (!wisata) {
            return res.status(400).json({message:"Data Wisata tidak ditemukan"})
        }

        const result = await Transaksi.findOne({
            attributes: [
                [sequelize.fn('sum', sequelize.col('jumlah_tiket')), 'total_pengunjung'],
            ],
            where: {
                id_wisata: wisata.id_wisata,
                status: 'Terkonfirmasi'
            }
        })

        const totalPengunjung = result.dataValues.total_pengunjung || 0
        res.status(200).json({
            message:`Total pengunjung berhasil didapatkan`,
            totalPengunjung: totalPengunjung
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({message:"Server Error", error: err.message})
    }
}

module.exports = {
    registerWisata,
    getWisata,
    updateWisataData,
    updateWisataGallery,
    checkHistoryTransaction,
    checkDetailHistoryTransaction,
    updateStatusTransaction,
    getTotalPenjualan,
    getTotalVisitor,
}