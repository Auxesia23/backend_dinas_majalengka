'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Pengelola extends Model {
        static associate(models) {
            this.belongsTo(models.User, {foreignKey:'id_user'})
            this.belongsTo(models.MessageApprovement, {foreignKey:'id_pengelola'})
            this.hasOne(models.Wisata, {foreignKey:'id_pengelola'})
        }
    }
    Pengelola.init({
        id_pengelola: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true
        },
        id_user: {
            type: DataTypes.STRING,
            allowNull:false,
            references:{
                model:'user',
                key:'id_user'
            },
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        tahun_operasi: {
            type: DataTypes.DATE,
            allowNull:false
        },
        url_ktp: {
            type: DataTypes.STRING,
            allowNull:false
        },
        url_npwp: {
            type: DataTypes.STRING,
            allowNull:false
        },
        url_nib: {
            type: DataTypes.STRING,
            allowNull:false
        },
        qr_code: {
            type: DataTypes.STRING,
            allowNull:false
        },
        is_approved: {
            type: DataTypes.ENUM(
                'Pending',
                'Disetujui',
                'Ditolak'
            ),
            allowNull: false,
            defaultValue: 'Pending'
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
        modelName:'Pengelola',
        tableName:'pengelola',
        timestamps:true
    })
    return Pengelola
}