const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Status = sequelize.define('Status',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    candidate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'allCandidates',
            key: 'id',
        }
    },
    status_name: {
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
    tableName: 'status_history',
})


module.exports = Status
