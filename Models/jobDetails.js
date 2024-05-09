const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Jobs = sequelize.define('Jobs',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    company_id: {
        type: DataTypes.BIGINT,
    },
    position: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    experience: {
        type: DataTypes.TEXT,
    },
    min_ctc: {
        type: DataTypes.STRING,
    },
    max_ctc: {
        type: DataTypes.STRING,
    },
    no_of_positions: {
        type: DataTypes.STRING,
    },
    gender_pref: {
        type: DataTypes.STRING,
    },
    qualification: {
        type: DataTypes.STRING,
    },
    jd_upload: {
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
    tableName: 'job_details',
})


module.exports = Jobs