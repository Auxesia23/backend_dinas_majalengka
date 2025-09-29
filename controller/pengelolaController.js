const {Pengelola, Wisata, GaleriWisata, Transaksi, TransaksiDetail, User, Scanner, sequelize} = require('../models')
const idGenerator = require('../helper/userIdGenerator')
const path = require('path')
const fs = require("node:fs")
const bcrypt = require("bcryptjs")
const transporter = require('../helper/email')
const ExcelJS = require('exceljs')
const { Op } = require('sequelize')

//REGISTER WISATA
const registerWisata = async (req, res) => {
    const { nama_wisata, deskripsi, lokasi, jam_buka, jam_tutup, jam_terbaik, hari_operasi, locationGoogleMaps, fasilitas, asuransi, harga_tiket} = req.body
    const filesGambar = req.files 
    const wisataImages = filesGambar.wisataImages
    const wisataImage = filesGambar.wisataImage
    if(req.user.id_role !== 'PNGL') {
        return res.status(401).json({message:"Lu bukan Pengelola"})
    }
    if(!wisataImages || wisataImages.length === 0) {
        return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' })
    }

    if (!nama_wisata) { return res.status(400).json({message: "Tolong isi nama Wisata!"}) }
    if (!deskripsi) { return res.status(400).json({message:"Tolong isi deskripsi wisata!"}) }
    if (!lokasi) { return res.status(400).json({message:"Tolong isi lokasi wisata!"}) }
    if (!jam_buka) { return res.status(400).json({message:"Tolong isi jam buka wisata!"}) }
    if (!jam_tutup) { return res.status(400).json({message:"Tolong isi jam tutup wisata!"}) }
    if (!hari_operasi) { return res.status(400).json({message:"Tolong isi hari operasi wisata!"}) }
    if (!locationGoogleMaps) { return res.status(400).json({message:"Tolong isi lokasi wisata!"}) }
    if (!fasilitas) { return res.status(400).json({message:"Tolong isi fasilitas wisata!"}) }
    if (!asuransi) { return res.status(400).json({message:"Tolong isi Asuransi wisata!"}) }
    if (!harga_tiket) { return res.status(400).json({message:"Tolong isi harga tiket wisata!"}) }

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
            nama_wisata: nama_wisata,
            deskripsi: deskripsi,
            lokasi: lokasi,
            jam_buka: jam_buka,
            jam_tutup: jam_tutup,
            jam_terbaik: jam_terbaik,
            hari_operasi: hari_operasi,
            locationGoogleMaps: locationGoogleMaps,
            fasilitas: fasilitas,
            asuransi: asuransi,
            harga_tiket: harga_tiket,
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
            return res.status(404).json({message: "Belum ada wisata maupun galeri"})
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
        const user = await User.findOne({
            where: {id_user: transaction.id_user}
        })
        const wisata = await Wisata.findOne({
            where: {id_wisata: transaction.id_wisata}
        })

        const recipientEmail = user.email
        const recipientName = user.nama_lengkap

        let emailSubject = ''
        let emailHtml = ''

        if (status === 'Terkonfirmasi') {
            emailSubject = 'Persetujuan Pemesanan Ticket Wisata Anda'
            emailHtml = `
                <h3>Halo, ${recipientName},</h3>
                <p>Pemesanan Ticket Anda telah **Disetujui** oleh Pengelola</p>
                <p>Sekarang Anda dapat mengunjungi wisata Kami ${wisata.nama_wisata}</p>
                <p>Terima Kasih.</p>
            `
        } else if (status === 'Dibatalkan') {
            emailSubject = 'Pembatalan Pemesanan Ticket Anda'
            emailHtml = `
                <h3>Halo, ${recipientName},</h3>
                <p>Pemesanan Ticket Anda telah **Ditolak** oleh Pengelola</p>
                <p>Mohon maaf harap hubungi customer service atau langsung mengunjungi ${wisata.nama_wisata}</p>
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

// MENAMBAHKAN AKUN SCANNER
const addScannerWisata = async (req, res) => {
    const idRole = req.user.id_role
    if (idRole !== 'PNGL') {
        return res.status(403).json({message:"Maaf anda bukan pengelola!"})
    }
    const idUser = req.user.id_user
    if (!idUser) {
        return res.status(400).json({message:"Id User tidak ditemukan! harap kembali"})
    }
    const pengelola = await Pengelola.findOne({ where: {id_user: idUser} })
    const wisata = await Wisata.findOne({ where: {id_pengelola: pengelola.id_pengelola} })
    const {nama_lengkap, email, tanggal_lahir, no_telpon, gender, password_hash} = req.body

    if (!nama_lengkap) { return res.status(400).json({message:"Tolong isi Nama lengkap"}) }
    if (!email) { return res.status(400).json({message:"Tolong isi Email"}) }
    if (!tanggal_lahir) { return res.status(400).json({message:"Tolong isi Tanggal Lahir"}) }
    if (!no_telpon) { return res.status(400).json({message:"Tolong isi nomor telpon"}) }
    if (!gender) { return res.status(400).json({message:"Tolong isi Gender"}) }
    if (!password_hash) { return res.status(400).json({message:"Tolong isi Password"}) }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email format is not valid!" })
    }

    if (password_hash.length < 8) {
        return res.status(400).json({ message: "Password must at least 8 characters!" })
    }
    const numberRegex = /[0-9]+/
    if (!numberRegex.test(password_hash)) {
        return res.status(400).json({ message: "Password must at least 1 number!" })
    }
    const upperCaseRegex = /[A-Z]+/
    if (!upperCaseRegex.test(password_hash)) {
        return res.status(400).json({ message: "Password must at least 1 Capital character!" })
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);
    if (!hashedPassword) {
        return res.status(400).json({message: "Please enter a password!"})
    }
    try {
        const existingUser = await User.findOne({
            where: { email: email}
        })
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists! Please use another email!" })
        }
        const userId = await idGenerator.generateUserId()
        const scannerId = await idGenerator.generateScannerId()
        const user = await User.create({
            id_user: userId,
            id_role: 'SCNR',
            nama_lengkap: nama_lengkap,
            email: email,
            tanggal_lahir: tanggal_lahir,
            no_telpon: no_telpon,
            gender: gender,
            password_hash:hashedPassword
        })
        const scannerUser = await Scanner.create({
            id_scanner: scannerId,
            id_user: user.id_user,
            id_wisata: wisata.id_wisata
        })
        res.status(200).json({
            message: 'Scanner added Successfully!',
            data: scannerUser
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({message:"Server Error", error: err.message})
    }
}

const getMonthlyRevenueReport = async (req, res) => {
    const { year, month } = req.params
    const idUser = req.user.id_user
    if (req.user.id_role !== 'PNGL' ) {
        return res.status(403).json({ message:"Hanya Pengelola saja yang boleh menggunakan fungsi ini!"})
    }
    try {
        if (!year || !month) {
            return res.status(400).json({ message: "Parameter tahun dan bulan wajib diisi!" })
        }

        const pengelola = await Pengelola.findOne({
            where: { id_user: idUser }
        })
        if (!pengelola) {
            return res.status(404).json({ message: "Pengelola tidak ditemukan" })
        }

        const wisata = await Wisata.findOne({
            where: {id_pengelola: pengelola.id_pengelola}
        })
        if (!wisata) {
            return res.status(404).json({ message: "Wisata tidak ditemukan untuk pengelola ini" })
        }

        const transactions = await Transaksi.findAll({
            where: {
                id_wisata: wisata.id_wisata,
                status: 'Terkonfirmasi',
                createdAt: {
                    [Op.gte]: new Date(year, month - 1, 1),
                    [Op.lt]: new Date(year, month, 1)
                }
            }
        })
        if (transactions.length === 0) {
            return res.status(404).json({ message: "Tidak ada transaksi ditemukan untuk periode ini." })
        }

        const reportData = []
        let no = 1
        for (const trans of transactions) {
            const detailTransaksi = await TransaksiDetail.findAll({
                where: { id_transaksi: trans.id_transaksi },
                attributes: [
                    [sequelize.fn('sum', sequelize.literal('CASE WHEN gender = "L" THEN 1 ELSE 0 END')), 'jumlah_laki'],
                    [sequelize.fn('sum', sequelize.literal('CASE WHEN gender = "P" THEN 1 ELSE 0 END')), 'jumlah_perempuan']
                ],
                raw: true
            })
            const totalTickets = await Transaksi.sum('jumlah_tiket', {
                where: { id_transaksi: trans.id_transaksi }
            })
            const detail = detailTransaksi[0]
            reportData.push({
                no: no++,
                id_transaksi: trans.id_transaksi,
                jumlah_laki: parseInt(detail ? detail.jumlah_laki : 0),
                jumlah_perempuan: parseInt(detail ? detail.jumlah_perempuan : 0),
                total_tiket: parseInt(totalTickets || 0),
                total_penjualan: parseFloat(trans.total_bayar)
            })
        }

        // Buat workbook Excel
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(`Laporan Penjualan Bulan ${year}-${month}`)

        // Atur judul
        worksheet.addRow([`Laporan Penjualan Bulan ${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`])
        worksheet.mergeCells('A1:F1')
        worksheet.getCell('A1').font = { size: 16, bold: true }
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }

        // Atur header kolom
        worksheet.addRow(['No.', 'ID Transaksi', 'Jumlah Laki-laki', 'Jumlah Perempuan', 'Total Tiket', 'Total Penjualan'])
        worksheet.getRow(2).font = { bold: true }

        // Masukin data
        reportData.forEach(row => {
            worksheet.addRow([
                row.no,
                row.id_transaksi,
                row.jumlah_laki,
                row.jumlah_perempuan,
                row.total_tiket,
                row.total_penjualan
            ])
        })
        // Mengatur format akuntansi untuk kolom 'Total Penjualan' (kolom F)
        worksheet.getColumn(6).numFmt = '"Rp"#,##0.00'

        // Atur respons header
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Penjualan_Wisata_${year}-${month}.xlsx`)

        // Kirim file
        await workbook.xlsx.write(res)
        res.end()

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server Error", error: err.message })
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
    addScannerWisata,
    getMonthlyRevenueReport
}