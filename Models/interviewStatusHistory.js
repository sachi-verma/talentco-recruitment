const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const InterviewStatus = sequelize.define('InterviewStatus',{
    id: {
      type: DataTypes.INTEGER,
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
    interview_status: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userDetails',
            key: 'id',
        }
    },
     
},
{
    tableName: 'interview_status_history',
})


module.exports = InterviewStatus
