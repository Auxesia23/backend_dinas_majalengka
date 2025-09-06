'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('scanner', {
            id_scanner : {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            id_user : {
                type: Sequelize.STRING,
                allowNull: false,
                preference: {
                    model: 'user',
                    key: 'id_user',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            id_wisata: {
                type: Sequelize.STRING,
                allowNull: false,
                preference: {
                    model: 'wisata',
                    key: 'id_wisata',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('scanner');
    }
};
