'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Scanner extends Model {
        static associate(models) {
            this.belongsTo(models.User, {foreignKey:'id_user'})
            this.belongsTo(models.Wisata, {foreignKey:'id_wisata'})
        }
    }
    Scanner.init({
        id_scanner : {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true
        },
        id_user : {
            type: DataTypes.STRING,
            allowNull: false,
            preference: {
                model: 'user',
                key: 'id_user',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        id_wisata: {
            type: DataTypes.STRING,
            allowNull: false,
            preference: {
                model: 'wisata',
                key: 'id_wisata',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
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
        modelName: 'Scanner',
        tableName: 'scanner',
        timestamps: true
    })
    return Scanner
}