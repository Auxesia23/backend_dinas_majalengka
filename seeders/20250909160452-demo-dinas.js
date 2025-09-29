'use strict';

const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('DinasMajalengka123', 15)
        const users = []
        users.push({
            id_user: 'USR0001',
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
        await queryInterface.bulkInsert('user', users, {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user', {
            id_role: 'DNS'
        }, {})
    }
};
