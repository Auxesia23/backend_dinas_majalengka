'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('roles', [
            {
                id_role: "DNS",
                role_name: "dinas"
            }, {
                id_role: "PNGL",
                role_name: "pengelola",
            }, {
                id_role: "USR",
                role_name: "user",
            }
        ])
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('roles', null, {})
    }
};
