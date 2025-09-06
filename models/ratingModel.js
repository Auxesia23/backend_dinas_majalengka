'use Strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Rating extends Model {
        static associate(models) {
            this.belongsTo(models.Wisata, {foreignKey:'wisataId'})
            this.belongsTo(models.User, {foreignKey:'userId'})
        }
    }
    Rating.init({
        wisataId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'wisata',
                key: 'id_wisata',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id_user',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
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
        modelName: 'Rating',
        tableName: 'rating',
        timestamps: true,
    })
    return Rating
}