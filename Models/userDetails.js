const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Users = sequelize.define('Users',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
    },
    designation: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    role_id: {
        type: DataTypes.BIGINT,
    },
    username_login: {
        type: DataTypes.STRING,
    },
    password_login: {
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
    tableName: 'user_details',
})


module.exports = Users
