const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Positions = sequelize.define('Positions',{
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'companyDetails',
            key: 'id'
        }
    },
    position: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    min_experience: {
        type: DataTypes.TEXT,
    },
    max_experience: {
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
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    position_status: {
        type: DataTypes.STRING,
    },
    recruiter_assign: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'userDetails',
            key: 'id'
        }
    },
    cv_sent: {
        type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_shortlisted: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_rejected: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_backout: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_interviewed: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_rejected_post_interview: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_feedback_pending: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_final_selection: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_offer_letter_sent: {
         type: DataTypes.INTEGER,
        defaultValue:0,
    },
    cv_final_join: {
         type: DataTypes.INTEGER,
        defaultValue:0,
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
    cv_confirmation_pending :{
        type: DataTypes.INTEGER,
        defaultValue:0
    },
    cv_screened :{
        type: DataTypes.INTEGER,
        defaultValue:0
    },
    cv_interview_scheduled:{
        type: DataTypes.INTEGER,
        defaultValue:0
    }
},
{
    tableName: 'all_positions',
})


module.exports = Positions