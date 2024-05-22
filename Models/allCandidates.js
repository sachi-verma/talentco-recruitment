const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Candidates = sequelize.define('Candidates',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    candidate: {
        type: DataTypes.STRING,
    },
    position: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'allPositions',
            key: 'id',
        }
    },
    candidate_location: {
        type: DataTypes.STRING,
    },
    candidate_experience: {
        type: DataTypes.TEXT,
    },
    candidate_ctc: {
        type: DataTypes.STRING,
    },
    candidate_qualification: {
        type: DataTypes.STRING,
    },
    candidate_gender: {
        type: DataTypes.STRING,
    },
    cv_sourced_from: {
        type: DataTypes.STRING,
    },
    relevant: {
        type: DataTypes.STRING,
    },
    candidate_status: {
        type: DataTypes.STRING,
    },
    resume_file: {
        type: DataTypes.STRING,
    },
    remarks: {
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
    },
    sourcing_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    }
},
{
    tableName: 'all_candidates',
})


module.exports = Candidates