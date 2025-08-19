const {Pengelola, Wisata, GaleriWisata, Transaksi, TransaksiDetail} = require('../models')
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
            lokasi: body.lokasi,
            jam_buka: body.jam_buka,
            jam_tutup: body.jam_tutup,
            jam_terbaik: body.jam_terbaik,
            coordinates: {
                type: 'Point',
                coordinates: [body.longtitude, body.latitude]
            },
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

        res.json({
            message:"Daftar Wisata Berhasil",
            data:wisata, 
            gambar_utama: `${wisataImage.length} gambar utama berhasil ditambahkan`,
            gambar_galeri: `${wisataImages.length} gambar berhasil ditambahkan ke galeri wisata`
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

//GET WISATA BERDASARKAN PENGELOLA ID
const getWisata = async (req, res) => {
    const idUser = req.user.id_user
    try {
        const pengelola = await Pengelola.findOne({where: {id_user: idUser}})
        if (!pengelola) {
            return res.status(404).json({ message: "Pengelola tidak ditemukan" });
        }
        const wisata = await Wisata.findOne({where:{id_pengelola: pengelola.id_pengelola}})
        const galeriWisata = await GaleriWisata.findAll({where: {id_wisata:wisata.id_wisata}})

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
        res.json({message:err.message})
    }
}

//UPDATE WISATA DATA -Images
//TODO: Ini Belum bisa update gambar
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
        if (body.lokasi) wisata.lokasi = body.lokasi
        if (body.jam_buka) wisata.jam_buka = body.jam_buka
        if (body.jam_tutup) wisata.jam_tutup = body.jam_tutup
        if (body.jam_terbaik) wisata.jam_terbaik = body.jam_terbaik
        if (body.fasilitas) wisata.fasilitas = body.fasilitas
        if (body.asuransi) wisata.asuransi = body.asuransi
        if (body.harga_tiket) wisata.harga_tiket = body.harga_tiket
        if (body.latitude && body.longitude) {
            wisata.coordinates = {
                type: 'Point',
                coordinates: [body.longitude, body.latitude]
            }
        }
        console.log(fileGambar)
        if (fileGambar) wisata.url_gambar_utama = fileGambar.path

        await wisata.save()
        res.status(200).json({message: "Data berhasil diupdate", data: wisata})
    } catch (err) {
        res.status(500).json({ message: err.message })
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

        res.json({
            message: "Galeri Wisata berhasil di update",
            galeri: updatedGaleri
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//CHECK HISTORY TRANSAKSI BERDASARKAN WISATA SI PENGELOLA
//TODO: Belum dicoba checkHistoryTransaction
const checkHistoryTransaction = async (req,res) => {
    const idUser = req.user.id_user
    const roleUser = req.user.role
    if (roleUser !== 'PNGL') {
        res.status(403).message({message:"Anda bukan pengelola! silahkan kembali"})
    }
    try {
        const pengelola = Pengelola.findOne({where: {id_user: idUser} })
        const wisata = Wisata.findOne({where: {id_pengelola: pengelola.id_pengelola}})
        const transaksi = Transaksi.findAll({where: {id_wisata: wisata.id_wisata}})
        res.status(200).json({
            message: "Data Transaksi berhasil didapatkan",
            transaksi: transaksi
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//GET DETAIL TRANSACTION
//TODO: Belum dicoba checkDetailHistoryTransaction
const checkDetailHistoryTransaction = async (req,res) => {
    const idUser = req.user.id_user
    const roleUser = req.user.role
    if (roleUser !== 'PNGL') {
        res.status(403).message({message:"Anda bukan pengelola! silahkan kembali"})
    }
    try {
        const pengelola = Pengelola.findOne({where: {id_user: idUser} })
        const wisata = Wisata.findOne({where: {id_pengelola: pengelola.id_pengelola}})
        const transaksi = Transaksi.findAll({where: {id_wisata: wisata.id_wisata}})
        const detailtransaksi = TransaksiDetail.findAll({where: {id_transaksi: transaksi.id_transaksi}})
        res.status(200).json({
            message: "Data Transaksi berhasil didapatkan",
            transaksi: transaksi,
            detailtransaksi: detailtransaksi
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//ENDPOINT UBAH STATUS TRANSAKSI
//TODO: Belum dicoba updateStatusTransaction
const updateStatusTransaction = async (req,res) => {
    const idTransaction = req.params.id
    const status = req.body.status
    if (!idTransaction) {
        res.status(400).message({message:"ID Transaksi tidak ada"})
    }
    if (!status) {
        res.status(400).message({message:"Status tidak ada"})
    }
    try {
        const transaction = await Transaksi.findOne({
            where: {id_transaksi: idTransaction}
        })
        if (status) {
            transaction.status = status
        }
        res.status(200).json({
            message:`Status transaksi ke-${idTransaction} berhasil diubah`,
            transaction: transaction
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    registerWisata,
    getWisata,
    updateWisataData,
    updateWisataGallery,
    checkHistoryTransaction,
    checkDetailHistoryTransaction,
    updateStatusTransaction
}