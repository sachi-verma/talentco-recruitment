const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Permissions = sequelize.define('Permissions',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id',
        }
    },
    module_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id',
        }
    },
    list_access: {
        type: DataTypes.BOOLEAN,
    },
    view_access: {
        type: DataTypes.BOOLEAN,
    },
    add_access: {
        type: DataTypes.BOOLEAN,
    },
    edit_access: {
        type: DataTypes.BOOLEAN,
    },
    delete_access: {
        type: DataTypes.BOOLEAN,
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
    tableName: 'permissions',
})


module.exports = Permissions
