const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Update = sequelize.define('Update', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
    update_date: {
        type: DataTypes.STRING,
    },
    total_cv_sourced: {
        type: DataTypes.STRING,
    },
    total_cv_relevant: {
        type: DataTypes.STRING,
    },
    total_confirmation_pending: {
        type: DataTypes.STRING,
    },
    total_sent_to_client: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.STRING,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_by: {
        type: DataTypes.STRING,
    }
},
{
    tableName: 'daily_sourcing_update',
})

module.exports = Update