'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Pengelola extends Model {
        static associate(models) {
            this.belongsTo(models.User, {foreignKey:'id_user'})
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
        }
    }, {
        sequelize,
        modelName:'Pengelola',
        tableName:'pengelola',
        timestamps:true
    })
    return Pengelola
}