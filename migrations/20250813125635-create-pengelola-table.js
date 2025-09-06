'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pengelola', {
            id_pengelola: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            id_user: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id_user'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tahun_operasi: {
                type: Sequelize.DATE,
                allowNull: false
            },
            url_ktp: {
                type: Sequelize.STRING,
                allowNull: false
            },
            url_npwp: {
                type: Sequelize.STRING,
                allowNull: false
            },
            url_nib: {
                type: Sequelize.STRING,
                allowNull: false
            },
            qr_code: {
                type: Sequelize.STRING,
                allowNull: false
            },
            is_approved: {
                type: Sequelize.ENUM(
                    'Pending',
                    'Disetujui',
                    'Ditolak'
                ),
                defaultValue: 'Pending',
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('pengelola')
    }
};
