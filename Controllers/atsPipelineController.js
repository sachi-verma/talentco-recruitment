const db = require('../Models/db');
const { Op } = require('sequelize');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');

exports.getAtsPipeline = async (req, res) => {
    try {
        const report = await Candidate.findAll({
            attributes: ['id', 'candidate', 'position', 'cv_sourced_from', 'relevant', 'candidate_status', 'remarks', 'created_at', 'updated_at'],
            include: [{ 
                model: Position,
                required: true,
                attributes: ['id', 'company_id', 'position', 'location', 'experience', 'min_ctc'],
                include: [{ 
                    model:Company,
                    required: true,
                    attributes: ['company_name']
                }]
            }],
            where: {
                // candidate_status: {
                //     [Op.ne]: 'sent to client'
                //     //Op is the object and ne stands for not equal
                // }
                candidate_status: 'sent to client',
            }
        }); 
        res.status(200).json({message: 'candidates fetched successfully', Candidates: report}); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.editAtsPipeline = async (req,res) => {
    try {
        const id = req.params.id;
        const { candidate_location, candidate_experience, candidate_ctc, candidate_qualification, candidate_gender } = req.body;
        await Candidate.update({ candidate_location, candidate_experience, candidate_ctc, candidate_qualification, candidate_gender }, {where: {id: id}});
  
        return res.status(200).json({ success: "candidate data updated sucessfully", candidate: {id, candidate_location, candidate_experience, candidate_ctc, candidate_qualification, candidate_gender} }); 

    } catch (error) {
        console.error('Error updating candidate:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}