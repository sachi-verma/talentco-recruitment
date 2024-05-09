const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Companys = sequelize.define('Companys',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    company_name: {
        type: DataTypes.STRING,
    },
    summary: {
        type: DataTypes.STRING,
    },
    industry: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.TEXT,
    },
    poc1_name: {
        type: DataTypes.STRING,
    },
    poc1_designation: {
        type: DataTypes.STRING,
    },
    poc1_phone: {
        type: DataTypes.STRING,
    },
    poc1_email: {
        type: DataTypes.STRING,
    },
    poc2_name: {
        type: DataTypes.STRING,
    },
    poc2_designation: {
        type: DataTypes.STRING,
    },
    poc2_phone: {
        type: DataTypes.STRING,
    },
    poc2_email: {
        type: DataTypes.STRING,
    },
    company_username: {
        type: DataTypes.STRING,
    },
    company_password: {
        type: DataTypes.STRING,
    },
    role_id: {
        type: DataTypes.BIGINT,
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
    tableName: 'company_details',
})


module.exports = Companys
