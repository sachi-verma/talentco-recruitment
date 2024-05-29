const db = require('../Models/db');
const { Sequelize} = require('sequelize');
const { Op } = require('sequelize');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const User = require('../Models/userDetails');
const Interview = require('../Models/interviewSchedule');

Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

Candidate.hasMany(Interview, { foreignKey: 'candidate_id' });
Interview.belongsTo(Candidate, { foreignKey: 'candidate_id' });

User.hasMany(Position, { foreignKey: 'recruiter_assign' });
Position.belongsTo(User, { foreignKey: 'recruiter_assign' });

exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.findAll({
            attributes: ['id', 'candidate', 'sourcing_status'],
            include: [{ 
                model: Position,
                required: true,
                attributes: ['company_id', 'position', 'location'],
                include: [{ 
                    model:Company,
                    required: true,
                    attributes: ['company_name']
                },
                {
                    model: User,
                    required: true,
                    attributes: ['name']
                }]
            }],
            where: {
                sourcing_status: {
                  [Op.notIn]: ['Rejected', 'Confirmation Pending']
                }
              } 
        });
        res.json(candidates);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getInterviewSchedule = async (req, res) => {
    try {
        const report = await Interview.findAll({
            include: [{
                model: Candidate,
                required: true,
                attributes: ['candidate'],
                include: [{ 
                    model: Position,
                    required: true,
                    attributes: ['company_id', 'position', 'location'],
                    include: [{ 
                        model:Company,
                        required: true,
                        attributes: ['company_name']
                    },
                    {
                        model: User,
                        required: true,
                        attributes: ['name']
                    }]
                }],
            }]
        }); 
        res.status(200).json({message: 'interview schedule fetched successfully', Interview: report}); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.addInterviewSchedule = async (req, res) => {
    try {
        const { id, candidate_id, interview_round, interview_mode, interview_date, interview_time, interview_location, interview_link, interview_status, interview_remarks, interview_done } = req.body;

        // // Define the required fields for validation
        // const requiredFields = ['id', 'candidate', 'interview_round', 'interview_mode', 'interview_date', 'interview_time', 'interview_location', 'interview_link', 'interview_status', 'interview_remarks', 'interview_done'];

        // // Validate the request body
        // for (let field of requiredFields) {
        //     if (!req.body.hasOwnProperty(field) || req.body[field] === null || req.body[field] === '') {
        //         console.error(`Missing or empty field: ${field} in report:`, req.body);
        //         return res.status(400).json({ error: `Missing or empty fields detected` });
        //     }
        // }

        const report = await Interview.create({ id, candidate_id, interview_round, interview_mode, interview_date, interview_time, interview_location, interview_link, interview_status, interview_remarks, interview_done });

        res.status(200).json({ message: 'Interview created successfully', report });
    } catch (error) {
        console.error('Error adding interview:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

exports.editInterviewSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const { interview_round, interview_mode, interview_date, interview_time, interview_location, interview_link, interview_status, interview_remarks, interview_done } = req.body;
        await Candidate.update({ interview_round, interview_mode, interview_date, interview_time, interview_location, interview_link, interview_status, interview_remarks, interview_done }, {where: {id: id}});
  
        return res.status(200).json({ success: "interview details updated sucessfully", candidate: {id, interview_round, interview_mode, interview_date, interview_time, interview_location, interview_link, interview_status, interview_remarks, interview_done} }); 

    } catch (error) {
        console.error('Error updating interview:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

exports.bulkInterviewSchedule = async (req, res) => {
    try {
        const interviewData = req.body; // Assuming the frontend sends an array of report objects
        console.log("=====>>>>>")
        if (!Array.isArray(interviewData) || interviewData.length === 0) {
            console.error('No interview data provided');
            return res.status(400).json({ error: 'No interview data provided' });
        }

        // // Define the required fields for validation
        // const requiredFields = ['id', 'candidate', 'interview_round', 'interview_mode', 'interview_date', 'interview_time', 'interview_location', 'interview_link', 'interview_status', 'interview_remarks', 'interview_done'];

        // // Validate each report object
        // for (let report of interviewData) {
        //     for (let field of requiredFields) {
        //         if (!report.hasOwnProperty(field) || report[field] === null || report[field] === '') {
        //             console.error(`Missing or empty field: ${field} in report:`, report);
        //             return res.status(400).json({ error: `Missing or empty fields detected` });
        //         }
        //     }
        // }
        
        const createdReports = await Interview.bulkCreate(interviewData);

        if (!createdReports || createdReports.length === 0) {
            console.error('No interview schedule created');
            return res.status(400).json({ error: 'No interview schedule created' });
        }

        res.status(200).json({ message: 'Interview schedule created successfully', reports: createdReports });
    } catch (error) {
        console.error('Error creating Interview Schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
