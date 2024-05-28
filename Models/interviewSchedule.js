const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Interview = sequelize.define('Interview',{
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
            key: 'id'
        }
    },
    interview_round: {
        type: DataTypes.STRING,
    },
    interview_mode: {
        type: DataTypes.STRING,
    },
    interview_date: {
        type: DataTypes.DATEONLY,
    },
    interview_time: {
        type: DataTypes.STRING,
    },
    interview_location: {
        type: DataTypes.STRING,
    },
    interview_link: {
        type: DataTypes.STRING,
    },
    interview_status: {
        type: DataTypes.STRING,
    },
    interview_remarks: {
        type: DataTypes.STRING,
    },
    interview_done: {
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
    tableName: 'interview_schedule',
})


module.exports = Interview