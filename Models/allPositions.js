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
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    position_status: {
        type: DataTypes.STRING,
    },
    recruiter_assign: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userDetails',
            key: 'id'
        }
    },
    cv_sent: {
        type: DataTypes.STRING,
    },
    cv_shortlisted: {
        type: DataTypes.STRING,
    },
    cv_rejected: {
        type: DataTypes.STRING,
    },
    cv_backout: {
        type: DataTypes.STRING,
    },
    cv_interviewed: {
        type: DataTypes.STRING,
    },
    cv_rejected_post_interview: {
        type: DataTypes.STRING,
    },
    cv_feedback_pending: {
        type: DataTypes.STRING,
    },
    cv_final_selection: {
        type: DataTypes.STRING,
    },
    cv_offer_letter_sent: {
        type: DataTypes.STRING,
    },
    cv_final_join: {
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
    tableName: 'all_positions',
})


module.exports = Positions