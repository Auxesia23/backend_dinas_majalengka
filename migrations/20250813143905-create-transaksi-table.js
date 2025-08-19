'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transaksi', {
            id_transaksi: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
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
            id_wisata: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'wisata',
                    key: 'id_wisata'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tanggal_kunjung: {
                type: Sequelize.DATE,
                allowNull: false
            },
            total_bayar: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('Terkonfirmasi', 'Pending', 'Dibatalkan'),
                allowNull: false
            },
            nama_pengirim: {
                type: Sequelize.STRING,
                allowNull: false
            },
            bukti_pembayaran: {
                type: Sequelize.STRING,
                allowNull: false
            },
            jumlah_tiket: {
                type: Sequelize.INTEGER,
                allowNull: true
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
        await queryInterface.dropTable('transaksi')
    }
};
