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
                no_telpon: `+628873645297${i}`,
                gender: i % 2 === 0 ? 'Laki-Laki' : 'Perempuan',
                password_hash: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            pengelolas.push({
                id_pengelola: pengelolaId,
                id_user: userId,
                tahun_operasi: new Date(),
                url_ktp: 'public/uploads/wisata/wisataImages-1755575167799.jpg',
                url_npwp: 'public/uploads/wisata/wisataImages-1755575167799.jpg',
                url_nib: 'public/uploads/wisata/wisataImages-1755575167799.jpg',
                qr_code: 'public/uploads/wisata/wisataImages-1755575167799.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            wisatas.push({
                id_wisata: wisataId,
                id_pengelola: pengelolaId,
                nama_wisata: `Wisata Keren ${i}`,
                deskripsi: "Limbus Company (Hangul: 림버스 컴퍼니, Rimbeoseu keompeoni), is an enigmatic company operating in the City, capitalizing on the fall of Lobotomy Corporation. While they are apparently supported by a number of wealthy backers (evidenced by their possession of HP Ampules and firearms) and have significant capital, the company's true goals are unknown. According to Dante, the company's various Departments all have their own aims with no common goal. Their known objectives are seek to recover the fallen Wing's E.G.O equipment, gather Enkephalin, contain Abnormalities, and ultimately obtain the Golden Boughs — the essence of L Corp's Singularity.\n" +
                    "\n" +
                    "Caiman of LCCA states that Limbus Company's Golden Bough operations are merely a side task, and that it is seeking to define itself as a company specializing in the handling and research of Distortions, a corporate counterpart to the similarly proposed 13th Association. The Limbus Company Bus Department,[2] or LCB, consists of thirteen employees designated as \"Sinners\". Their name is derived from their mode of transportation, the special bus, Mephistopheles.\n" +
                    "\n" +
                    "Each Sinner was specifically recruited because of their ability to resonate with Sinner #10, Dante, who acts as the Executive Manager for the department. Aside from resurrecting via Dante's clock, the Sinners can also resonate with the Golden Boughs within the Lobotomy Corp. Branch facilities, and are thus tasked to venture into the treacherous underground dungeons in order to retrieve them.\n" +
                    "\n" +
                    "The Color Fixer known as the Red Gaze, Vergilius, was scouted and recruited by Faust to guide the LCB across the City on the promise to restore Lapis' Identity from Charon's body — who now acts as the driver of Mephistopheles. ",
                lokasi: `Lokasi Wisata ${i}`,
                jam_buka: '08:00:00',
                jam_tutup: '17:00:00',
                jam_terbaik: '10:00:00',
                hari_operasi: JSON.stringify(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
                locationGoogleMaps: 'https://maps.app.goo.gl/B2ZQkSn1MECZriSt6',
                fasilitas: JSON.stringify(['Toilet', 'Parkir', 'Mushola']),
                asuransi: true,
                harga_tiket: 50000.00,
                url_gambar_utama: 'public/uploads/wisata/wisataImages-1755575167799.jpg',
                averageRating: 0,
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
                no_telpon: `+628895123425${i}`,
                gender: i % 2 === 0 ? 'Laki-Laki' : 'Perempuan',
                password_hash: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
        }

        users.push({
            id_user: 'USR0101',
            id_role: 'DNS',
            nama_lengkap: `Dinas Pariwisata Majalengka`,
            email: `majalengka.dinas@gmail.com`,
            tanggal_lahir: new Date(),
            no_telpon: `+6287745332890`,
            gender: `Laki-Laki`,
            password_hash: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

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
        await queryInterface.bulkDelete('user', {
            id_role: 'DNS'
        }, {})
    }
};
