'use Strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class TransaksiDetail extends Model {
        static associate(models) {
            this.belongsTo(models.Transaksi, {foreignKey:'id_transaksi'})
        }
    }
    TransaksiDetail.init({
        id_tiket:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull:false,
            unique:true,
            primaryKey:true
        },
        id_transaksi:{
            type: DataTypes.UUID,
            allowNull:false,
            references:{
            model:'transaksi',
            key:'id_transaksi'
            },
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        gender:{
            type: DataTypes.ENUM('L', 'P'),
            allowNull:false
        },
        umur:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        harga:{
            type: DataTypes.FLOAT,
            allowNull:false
        }
    }, {
        sequelize,
        modelName:'TransaksiDetail',
        tableName:'transaksi_detail',
        timestamps:true
    })
    return TransaksiDetail
}