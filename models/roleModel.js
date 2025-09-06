'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            this.hasMany(models.User, {foreignKey:'id_role'})
        }
    }
    Role.init({
        id_role: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        role_name:DataTypes.ENUM(
            'dinas',
            'pengelola',
            'scanner',
            'user'
        )
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles'
    })
    return Role
}