'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user', {
            id_user: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
                primaryKey: true
            },
            id_role: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id_role'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            nama_lengkap: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            tanggal_lahir: {
                type: Sequelize.DATE,
                allowNull: false
            },
            no_telpon: {
                type: Sequelize.STRING,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM('Laki-Laki', 'Perempuan'),
                allowNull: false
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            reset_password_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            reset_password_expires: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('user')
    }
};
