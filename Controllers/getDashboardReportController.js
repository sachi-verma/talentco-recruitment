const db = require('../Models/db');
const { Sequelize} = require('sequelize');
const Position = require('../Models/allPositions');
const Candidates = require('../Models/allCandidates');
const Users = require("../Models/userDetails");
const excel = require("exceljs");
const Roles = require("../Models/roles");
const assignRecruiter = require("../Models/assignRecruiter");
const Company = require("../Models/companyDetails");

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });



exports.getDashBoradReport = async (req, res) => {
    try {
        const whereClause ={
            position_status: 'Open',
        };

        const result = await Position.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_open_positions' ],
                [Sequelize.fn('SUM', Sequelize.col('cv_sent')), 'total_cv_sent'],
                [Sequelize.fn('SUM', Sequelize.col('cv_shortlisted')), 'total_cv_shortlisted'],
                [Sequelize.fn('SUM', Sequelize.col('cv_backout')), 'total_cv_backout'],
                [Sequelize.fn('SUM', Sequelize.col('cv_interviewed')), 'total_cv_interviewed'],
                [Sequelize.fn('SUM', Sequelize.col('cv_rejected_post_interview')), 'total_cv_rejected_post_interview'],
                [Sequelize.fn('SUM', Sequelize.col('cv_feedback_pending')), 'total_cv_feedback_pending'],
                [Sequelize.fn('SUM', Sequelize.col('cv_final_selection')), 'total_cv_final_selection'],
                [Sequelize.fn('SUM', Sequelize.col('cv_offer_letter_sent')), 'total_cv_offer_letter_sent'],
                [Sequelize.fn('SUM', Sequelize.col('cv_final_join')), 'total_cv_final_join'],
                [Sequelize.fn('SUM', Sequelize.col('cv_confirmation_pending')), 'total_cv_confirmation_pending'],
                [Sequelize.fn('SUM', Sequelize.col('cv_screened')), 'total_cv_screened'],
                [Sequelize.fn('SUM', Sequelize.col('cv_rejected')), 'total_cv_rejected'],
                [Sequelize.fn('SUM', Sequelize.col('cv_interview_scheduled')), 'total_cv_interview_scheduled']
            ],
            where: whereClause,
        });

        const data = result[0].dataValues;
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.getNewReports = async (req, res)=>{
    try {

        const userId = req.query.id; 

        const user = await Users.findByPk(userId);
        let role_id;
        let role;
        let recruiterFilter = {};
      
        if (user) {
          role_id = user.role_id;
          console.log("========>", role_id, user);
      
          if (role_id) {
            role = await Roles.findOne({ where: { id: role_id } });
            console.log("=========>>>>>>>>>>>>>>", role);
      
            if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
              recruiterFilter.recruiter_id = userId;
            }
            
          }
        }
        const statusMappings = [
          { status: "Sent To Client" },
          { status: "CV Rejected" },
          { status: "Shortlisted" },
          { status: "Interview Scheduled" },
          { status: "Interview Done" },
          { status: "Rejected Post Interview" },
          { status: "Final Selection" },
          { status: "Offer Letter Sent" },
          { status: "Final Joining" },
          { status: "Feedback Pending" },
          { status: "Backout" }
        ];
        let yoo = [];
    
        for (let mapping of statusMappings) {
         let candidates= await Candidates.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
          ],
          include: [
            {
              model: Position,
              required: true,
              
              attributes: [
                "id",
                "company_id",
                "position",
                "location",
                "recruiter_assign",
                "experience",
                "min_ctc",
                "max_ctc",
              ],
              include: [
                {
                  model: Company,
                  required: true,
                  attributes: ["company_name"],
                  
                },
                {
                  model: assignRecruiter,
                  required:  true,  
                  attributes: ["recruiter_id"],
                  where: recruiterFilter,
                  include: [
                    {
                      model: Users,
                      attributes: ["name"],  
                    },
                  ],
                },
              ],
            },
          ],
          where: { candidate_status: mapping.status }
        });
    
          // Extract the count from the query result
          const count = candidates[0]?.get('count') || 0;
          console.log(candidates);
          yoo.push({ status: mapping.status, count });
        }

        let candidate= await Candidates.findAll({
          attributes: [
          "id",
          "candidate",
          "position",
          "cv_sourced_from",
          "candidate_Status",
            //[Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
          ],
          include: [
            {
              model: Position,
              required: true,
              
              attributes: [
                "id",
                "company_id",
                "position",
                "location",
                "recruiter_assign",
                "experience",
                "min_ctc",
                "max_ctc",
              ],
              include: [
                {
                  model: Company,
                  required: true,
                  attributes: ["company_name"],
                  
                },
                {
                  model: assignRecruiter,
                  required:  true,  
                  attributes: ["recruiter_id"],
                  where: recruiterFilter,
                  include: [
                    {
                      model: Users,
                      attributes: ["name"],  
                    },
                  ],
                },
              ],
            },
          ],
         // where: { candidate_status: mapping.status }
         where: { candidate_Status: "Sent To Client",}
        });
        
        console.log("================================>> sent to client", yoo);
        res.status(200).json({yoo, candidate});
 
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        
    }

};