const {sequelize} = require('../db');
const {DataTypes} = require('sequelize');

const CVs = sequelize.define('allCV',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    job_title: {
        type: DataTypes.STRING,
    },
    skills: {
        type: DataTypes.TEXT,
    },
    summary: {
        type: DataTypes.TEXT,
    },
    industry: {
        type: DataTypes.STRING,
    },
    current_location: {
        type: DataTypes.STRING,
    },
    experience: {
        type: DataTypes.INTEGER,
    },
    current_designation: {
        type: DataTypes.STRING,
    },
    ug_degree: {
        type: DataTypes.STRING,
    },
    ug_spl: {
        type: DataTypes.STRING,
    },
    pg_degree: {
        type: DataTypes.STRING,
    },
    pg_spl: {
        type: DataTypes.STRING,
    },
    cand_name: {
        type: DataTypes.STRING,
    },
    func_area: {
        type: DataTypes.STRING,
    },
    current_company: {
        type: DataTypes.STRING,
    },
    preferred_location: {
        type: DataTypes.STRING,
    },
    annual_salary: {
        type: DataTypes.STRING,
    },
    notice_period: {
        type: DataTypes.STRING,
    },
    dob: {
        type: DataTypes.DATEONLY,
    },
    age: {
        type: DataTypes.INTEGER,
    },
    marital_status: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    gender: {
        type: DataTypes.STRING,
    },
    work_permit: {
        type: DataTypes.STRING,
    },
    filename: {
        type: DataTypes.STRING,
    },
    resume: {
        type: DataTypes.STRING,
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
     
},
{
    tableName: 'csvupload',
})


module.exports = CVs