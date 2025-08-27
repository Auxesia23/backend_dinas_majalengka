'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.belongsTo(models.Role, {foreignKey:'id_role'})
            this.belongsTo(models.Rating, {foreignKey:'id_user'})
            this.hasOne(models.Pengelola, {foreignKey:'id_user'})
            this.hasMany(models.Transaksi, {foreignKey:'id_user'})
        }
    }
    User.init({
        id_user:{
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true
        },
        id_role: {
            type: DataTypes.STRING,
            allowNull:true,
            references: {
                model: 'roles',
                key: 'id_role'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        nama_lengkap:DataTypes.STRING,
        email:DataTypes.STRING,
        tanggal_lahir:DataTypes.DATE,
        no_telpon:DataTypes.STRING,
        gender:DataTypes.ENUM('Laki-Laki', 'Perempuan'),
        password_hash:DataTypes.STRING,
        reset_password_token:DataTypes.STRING,
        reset_password_expires:DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'user',
        timestamps:true
    })
    return User
}