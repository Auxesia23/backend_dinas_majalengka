'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rating', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            wisataId: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'wisata',
                    key: 'id_wisata',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            userId: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id_user',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5,
                }
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: false,
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
        await queryInterface.dropTable('rating')
    }
};
