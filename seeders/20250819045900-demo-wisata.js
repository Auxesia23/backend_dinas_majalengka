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

        for (let i = 1; i <= 30; i++) {
            const userId = `USR${String(i).padStart(4, '0')}`;
            const pengelolaId = `PNGL${String(i).padStart(4, '0')}`;
            const wisataId = `WST${String(i).padStart(4, '0')}`;

            users.push({
                id_user: userId,
                id_role: 'PNGL',
                nama_lengkap: `Pengelola Wisata ${i}`,
                email: `pengelola${i}@example.com`,
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
    }
};
