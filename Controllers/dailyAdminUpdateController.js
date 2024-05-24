const db = require('../Models/db');
const AdminUpdate = require('../Models/dailyAdminUpdate');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');

Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

Candidate.hasMany(AdminUpdate, { foreignKey: 'candidate_id'});
AdminUpdate.belongsTo(Candidate, { foreignKey: 'candidate_id' });

exports.getAdminUpdate = async (req, res) => {
    try {
        const update

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}