'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transaksi_detail', {
            id_tiket: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            id_transaksi: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'transaksi',
                    key: 'id_transaksi'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            gender: {
                type: Sequelize.ENUM('L', 'P'),
                allowNull: false
            },
            umur: {
                type: Sequelize.ENUM(
                    'Balita',
                    'Anak-anak',
                    'Remaja',
                    'Dewasa',
                    'Lansia'
                ),
                allowNull: false
            },
            harga: {
                type: Sequelize.FLOAT,
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
        await queryInterface.dropTable('transaksi_detail')
    }
};
