const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Roles = sequelize.define('Roles',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role_name: {
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
    tableName: 'roles',
})


module.exports = Roles
