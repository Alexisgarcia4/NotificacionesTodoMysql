const { DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = require('../config/config');

const Subscription = sequelize.define(
    'Subscription',
    {
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        p256dh: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        auth: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: process.env.DB_NAME_TABLE, // Asegura que Sequelize use el nombre correcto
        timestamps: true, // Maneja createdAt y updatedAt automáticamente
    }
);

module.exports = Subscription;
