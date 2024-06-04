const db = require('../Models/db');
const { Sequelize} = require('sequelize');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const AdminUpdate = require('../Models/dailyAdminUpdate');
const User = require('../Models/userDetails');


Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

User.hasMany(Position, { foreignKey: 'recruiter_assign' });
Position.belongsTo(User, { foreignKey: 'recruiter_assign' });

exports.getScreenedCandidate = async (req, res) => {
        try {
            const candidates = await Candidate.findAll({
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
                    sourcing_status: 'Screened'
                  } 
            });
            res.json(candidates);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    
}