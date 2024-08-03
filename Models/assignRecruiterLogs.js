const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const assignRecruiterLogs = sequelize.define('assignRecuiterLogs',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    position_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'allPositions',
            key: 'id'
        }
    },
    recruiter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userDetails',
            key: 'id'
        }
    },
    active:{
        type: DataTypes.INTEGER,
        default:0
    },
    created_by:{
        type: DataTypes.INTEGER,
        references:{
            model: 'userDetails',
            key: 'id'
        }
    },
    created_at:{
        type: DataTypes.DATEONLY
    },
    removed_at:{
        type: DataTypes.DATEONLY
    },
    removed_by:{
        type: DataTypes.INTEGER,
        references:{
            model: 'userDetails',
            key: 'id'
        }
    }
} ,
{
    tableName: 'assign_recruiter_logs',
});

module.exports = assignRecruiterLogs;