'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class MessageApprovement extends Model {
        static associate(models) {
            this.hasOne(models.Pengelola, {foreignKey:'id_pengelola'})
        }
    }
    MessageApprovement.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        idPengelola: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'pengelola',
                key: 'id_pengelola'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        pesan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
        }
    }, {
        sequelize,
        modelName:'MessageApprovement',
        tableName:'message_approvements',
        timestamps:true
    })
    return MessageApprovement
}