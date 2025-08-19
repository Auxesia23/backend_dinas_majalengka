'use Strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GaleriWisata extends Model {
        static associate(models) {
            this.belongsTo(models.Transaksi, {foreignKey:'id_wisata'})
        }
    }
    GaleriWisata.init({
        id_galery_wisata:{
            type: DataTypes.INTEGER,
            allowNull:false,
            unique:false,
            primaryKey:true,
            autoIncrement:true
        },
        id_wisata:{
            type: DataTypes.STRING,
            allowNull:false,
            references:{
            model:'wisata',
            key:'id_wisata'
            },
            onDelete:'CASCADE',
            onUpdate:'CASCADE'
        },
        url_gambar:{
            type: DataTypes.STRING,
            allowNull:false
        }
    }, {
        sequelize,
        modelName:'GaleriWisata',
        tableName:'galeri_wisata',
        timestamps:true
    })
    return GaleriWisata
}