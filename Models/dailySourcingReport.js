const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
    candidate: {
        type: DataTypes.STRING,
    },
    company: {
        type: DataTypes.STRING,
    },
    position: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    ctc: {
        type: DataTypes.STRING,
    },
    cv_sourced_from: {
        type: DataTypes.STRING,
    },
    relevant: {
        type: DataTypes.STRING,
    },
    candidate_status: {
        type: DataTypes.STRING,
    },
    remarks: {
        type: DataTypes.STRING,
    },
    sourcing_date: {
        type: DataTypes.DATE,
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
    tableName: 'daily_sourcing_report',
})

module.exports = Report