const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const assignRecruiter = sequelize.define('assignRecuiter',{
    id: {
      type: DataTypes.INTEGER,
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
   
} ,
{
    tableName: 'assign_recruiter',
});

module.exports = assignRecruiter;