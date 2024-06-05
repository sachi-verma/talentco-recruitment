const db = require('../Models/db');
const { Op,Sequelize} = require('sequelize');
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

exports.getScreenedCandidatePagination = async (req, res) => {

        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit; 

            const filter = req.query.filter ? JSON.parse(req.query.filter):"";

            console.log(filter);  


           const {position, company, location, candidate, fromDate, toDate}= filter;

           const whereClause = {
            sourcing_status: 'Screened',

           };

           const companyFilters={};

           if (position) whereClause.position = { [Op.like]: `%${position}%` };
           if (location) whereClause.location = { [Op.like]: `%${location}%` };
           if (company) companyFilters.company_name = { [Op.like]: `%${company}%` };
           if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };
            
           if (fromDate && toDate) {
            let theDate = parseInt(toDate.split('-')[2]) + 1;
            let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, '0');
            whereClause.sourcing_date = {
              [Op.between]: [fromDate, newDate],
            };
          } else if (fromDate) { 
            whereClause.sourcing_date = {
              [Op.gte]:  fromDate,
            };
          } else if (toDate) {
            whereClause.sourcing_date = {
              [Op.lte]:  toDate,
            };
          }

           const [candidates, totalRecords]= await Promise.all([
            await Candidate.findAll({
                include: [{ 
                    model: Position,
                    required: true,
                    attributes: ['company_id', 'position', 'location'],
                    include: [{ 
                        model:Company,
                        required: true,
                        attributes: ['company_name'],
                        where: companyFilters
                    },
                    {
                        model: User,
                        required: true,
                        attributes: ['name']
                    }]
                }],
                where: whereClause,
                  limit,
                  offset,
            }),

            await Candidate.count({
                include: [{ 
                    model: Position,
                    required: true,
                    attributes: ['company_id', 'position', 'location'],
                    include: [{ 
                        model:Company,
                        required: true,
                        attributes: ['company_name'],
                        where: companyFilters
                    },
                    {
                        model: User,
                        required: true,
                        attributes: ['name']
                    }]
                }],
                where: whereClause,
            })

           ]);
           let records = candidates.length;

           const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
            
            res.json({candidates:candidates, pages:pages, totalRecords: filter?records:totalRecords});
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    
}