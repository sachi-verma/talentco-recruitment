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
    candidate_phone: {
        type: DataTypes.STRING,
    },
    candidate_email: {
        type: DataTypes.STRING,
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
    sourcing_status: {
        type: DataTypes.STRING,
    },
    sourcing_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    candidate_status: {
        type: DataTypes.STRING,
    },
    status_date: {
        type: DataTypes.DATEONLY,
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
    }
},
{
    tableName: 'all_candidates',
})


module.exports = Candidates