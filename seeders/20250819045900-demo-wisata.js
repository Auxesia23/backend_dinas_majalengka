'use strict';

/** @type {import('sequelize-cli').Migration} */
const {v4: uuidv4} = require('uuid')
const bcrypt = require('bcryptjs')
module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = [];
        const pengelolas = [];
        const wisatas = [];

        for (let i = 1; i <= 50; i++) {
            const userId = `USR${String(i).padStart(4, '0')}`;
            const pengelolaId = `PNGL${String(i).padStart(4, '0')}`;
            const wisataId = `WST${String(i).padStart(4, '0')}`;

            users.push({
                id_user: userId,
                id_role: 'PNGL',
                nama_lengkap: `Pengelola Wisata ${i}`,
                email: `pengelola${i}@gmail.com`,
                tanggal_lahir: new Date(),
                no_telpon: `0812345678${i}`,
                gender: i % 2 === 0 ? 'Laki-Laki' : 'Perempuan',
                password_hash: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            pengelolas.push({
                id_pengelola: pengelolaId,
                id_user: userId,
                tahun_operasi: new Date(),
                url_ktp: 'public/uploads/pengelola/ktp-dummy.png',
                url_npwp: 'public/uploads/pengelola/npwp-dummy.png',
                url_nib: 'public/uploads/pengelola/nib-dummy.png',
                qr_code: 'public/uploads/pengelola/qr-dummy.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            wisatas.push({
                id_wisata: wisataId,
                id_pengelola: pengelolaId,
                nama_wisata: `Wisata Keren ${i}`,
                deskripsi: "Deskripsi Wisata: [Nama Tempat Wisata]\n" +
                    "\n" +
                    "[Nama Tempat Wisata] bukan cuma sekadar tempat, tapi vibe yang harus lo rasain sendiri. Terletak di [Lokasi Spesifik: Kota/Kabupaten, Provinsi], tempat ini ngasih lo escape sejenak dari hiruk pikuk kota. Kalo lo nyari spot buat refreshing, healing, atau sekadar update story Instagram yang estetik, ini jawabannya.\n" +
                    "\n" +
                    "[Paragraf kedua, fokusin ke pengalaman unik di tempat itu]\n" +
                    "\n" +
                    "Di sini, lo bakal nemuin [sebutin daya tarik utama, contoh: keindahan alam yang masih asri, arsitektur bersejarah, atau wahana modern yang seru]. Jangan kaget kalo setiap sudutnya tuh photo-worthy. Lo bisa [sebutin aktivitas yang bisa dilakuin, contoh: trekking di jalur hutan pinus, foto-foto di spot jembatan kaca, atau santai di kafe dengan pemandangan danau]. Kalo lo bawa squad, bisa banget [sebutin kegiatan bareng-bareng, contoh: piknik bareng di taman, main game seru, atau nyari jajanan lokal yang viral]. Suasananya tuh beneran bikin nyaman dan betah.\n" +
                    "\n" +
                    "[Paragraf ketiga, bahas fasilitas dan tips]\n" +
                    "\n" +
                    "Fasilitasnya juga lengkap, jadi lo gak perlu pusing. Ada [sebutin fasilitas, contoh: area parkir luas, toilet bersih, mushola, dan area makan dengan pilihan kuliner yang beragam]. Buat yang pengen lebih chill, ada juga [fasilitas tambahan, contoh: tempat penyewaan sepeda atau gazebo buat nyantai]. Tips dari gue, datang pas [waktu terbaik, contoh: pagi hari atau sore menjelang sunset] biar lo bisa dapet golden hour yang cakep banget. Jangan lupa bawa [barang yang disarankan, contoh: jaket karena udaranya dingin atau power bank buat jaga-jaga].",
                lokasi: `Lokasi Wisata ${i}`,
                jam_buka: '08:00:00',
                jam_tutup: '17:00:00',
                jam_terbaik: '10:00:00',
                hari_operasi: JSON.stringify(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
                coordinates: Sequelize.fn('ST_GeomFromText', 'POINT(-6.8834 108.2235)'),
                fasilitas: JSON.stringify(['Toilet', 'Parkir', 'Mushola']),
                asuransi: true,
                harga_tiket: 50000.00,
                url_gambar_utama: 'public/uploads/wisata/wisataImage-1755575185252.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        for (let i = 51; i <= 100; i++) {
            const userId = `USR${String(i).padStart(4, '0')}`
            users.push({
                id_user: userId,
                id_role: 'USR',
                nama_lengkap: `User Biasa ${i}`,
                email: `user${i}@gmail.com`,
                tanggal_lahir: new Date(),
                no_telpon: `0812345678${i}`,
                gender: i % 2 === 0 ? 'Laki-Laki' : 'Perempuan',
                password_hash: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        }

        await queryInterface.bulkInsert('user', users, {});
        await queryInterface.bulkInsert('pengelola', pengelolas, {});
        await queryInterface.bulkInsert('wisata', wisatas, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('wisata', null, {});
        await queryInterface.bulkDelete('pengelola', null, {});
        await queryInterface.bulkDelete('user', {
            id_role: 'PNGL'
        }, {});
        await queryInterface.bulkDelete('user', {
            id_role: 'USR'
        }, {});
    }
};
