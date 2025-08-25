'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('wisata', {
            id_wisata: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false,
                primaryKey: true
            },
            id_pengelola: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                references: {
                    model: 'pengelola',
                    key: 'id_pengelola'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            nama_wisata: {
                type: Sequelize.STRING,
                allowNull: false
            },
            deskripsi: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            lokasi: {
                type: Sequelize.STRING,
                allowNull: false
            },
            jam_buka: {
                type: Sequelize.TIME,
                allowNull: false
            },
            jam_tutup: {
                type: Sequelize.TIME,
                allowNull: false
            },
            jam_terbaik: {
                type: Sequelize.TIME,
                allowNull: false
            },
            hari_operasi: {
                type: Sequelize.JSON,
                allowNull: true
            },
            coordinates: {
                type: Sequelize.GEOMETRY('POINT'),
                allowNull: false
            },
            fasilitas: {
                type: Sequelize.JSON,
                allowNull: false
            },
            asuransi: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            harga_tiket: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            url_gambar_utama: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('wisata')
    }
};
