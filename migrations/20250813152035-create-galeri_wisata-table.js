'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('galeri_wisata', {
            id_galery_wisata: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: false,
                primaryKey: true,
                autoIncrement: true
            },
            id_wisata: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'wisata',
                    key: 'id_wisata'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            url_gambar: {
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
        await queryInterface.dropTable('galeri_wisata')
    }
};
