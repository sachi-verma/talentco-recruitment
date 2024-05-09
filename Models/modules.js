const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Modules = sequelize.define('Modules',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    module_name: {
        type: DataTypes.STRING,
    },
    module_name: {
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
    tableName: 'modules',
})


module.exports = Modules
