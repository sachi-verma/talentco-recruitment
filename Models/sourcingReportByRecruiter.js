const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');
 

const sourcingReportByRecruiter = sequelize.define('sourcingReportByRecruiter',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    recruiter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userDetails',
            key: 'id',
        }
    },
    total_cv_sourced: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cv_relevant :{
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cv_confirmation_pending:{
        type: DataTypes.INTEGER,
        defaultValue: 0,

    },
    sent_to_client: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cv_rejected: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    shortlisted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    interview_schedule: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    interview_done: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    reject_post_interview: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    final_selection: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
     offer_letter_sent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
     final_joining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
      feedback_pending: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
      backout: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    report_date:{
        type: DataTypes.DATEONLY
 
    }
},
{
    tableName: 'sourcing_report_by_recruiter',
})


module.exports = sourcingReportByRecruiter
