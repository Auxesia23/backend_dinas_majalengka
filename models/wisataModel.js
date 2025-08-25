'use Strict'
const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Wisata extends Model {
        static associate(models) {
            this.belongsTo(models.Pengelola, {foreignKey:'id_pengelola'})
            this.hasMany(models.Transaksi, {foreignKey:'id_wisata'})
            this.hasMany(models.GaleriWisata, {foreignKey:'id_wisata'})
        }
    }
    Wisata.init({
        id_wisata:{
            type: DataTypes.STRING,
            allowNull:false,
            unique:false,
            primaryKey:true
        },
        id_pengelola:{
            type: DataTypes.STRING,
            allowNull:false,
            references:{
                model:'pengelola',
                key:'id_pengelola'
            },
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        nama_wisata:{
            type: DataTypes.STRING,
            allowNull:false
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull:false
        },
        lokasi:{
            type: DataTypes.STRING,
            allowNull:false
        },
        jam_buka:{
            type: DataTypes.TIME,
            allowNull:false
        },
        jam_tutup:{
            type: DataTypes.TIME,
            allowNull:false
        },
        jam_terbaik:{
            type: DataTypes.TIME,
            allowNull:false
        },
        hari_operasi: {
            type: DataTypes.JSON,
            allowNull:true
        },
        coordinates:{
            type: DataTypes.GEOMETRY('POINT'),
            allowNull:false
        },
        fasilitas:{
            type: DataTypes.JSON,
            allowNull:false
        },
        asuransi:{
            type: DataTypes.BOOLEAN,
            allowNull:false
        },
        harga_tiket:{
            type: DataTypes.FLOAT,
            allowNull:false
        },
        url_gambar_utama:{
            type: DataTypes.STRING,
            allowNull:false
        }
    }, {
        sequelize,
        modelName:'Wisata',
        tableName:'wisata',
        timestamps:true
    })
    return Wisata
}