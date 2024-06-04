const db = require("../Models/db");
const Jobs = require("../Models/jobDetails");
const Positions = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const { Op } = require("sequelize");

exports.getJobByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; 

    const filter = req.query.filter ? JSON.parse(req.query.filter):"";

    console.log(filter);  


    const {position, company, location, gender, qualification, recruiterId}= filter;

    // const position = req.query.position;
    // const companyName = req.query.companyName;
    // const location = req.query.location;
    // const industryName = req.query.industryName;
    //const assignRecruiter = req.query.assignRecruiter;

    console.log(position, company, location, gender, qualification, recruiterId);
 
    const companyFilters = {};
    if (company) {
      companyFilters.company_name = { [Op.like]: `%${company}%` };
    }
    // if (industryName) {
    //   companyFilters.industry = { [Op.like]: `%${industryName}%` };
    // }
 
    // const positionFilter = position
    //   ? { position: { [Op.like]: `%${position}%` } }
    //   : {};

    // const locationFilter = location
    //   ? { location: { [Op.like]: `%${location}%` } }
    //   : {};

    //   const genderFilter = gender?{gender_pref:{[Op.like]:`%${gender}%`}}:{};
    //   const qualificationFilter = qualification?{qualification:{[Op.like]:`%${qualification}%`}}:{};
    //   const recruiterIdFilter = recruiterId?{recruiter_assign:{[Op.like]:`%${recruiterId}%`}}:{};

    const whereClause = {};
    if (position) whereClause.position = { [Op.like]: `%${position}%` };
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (gender) whereClause.gender_pref = { [Op.like]: `%${gender}%` };
    if (qualification) whereClause.qualification = { [Op.like]: `%${qualification}%` };
    if (recruiterId) whereClause.recruiter_assign = { [Op.like]: `%${recruiterId}%` };

    console.log('Where clause:', whereClause);
    console.log('Company filters:', companyFilters);


      const [job, totalRecords] = await Promise.all([
        Positions.findAll({
          include: [
            {
              model: Company,
              required: true,
              where: companyFilters,
            },
          ],
          where:whereClause,
          limit,
          offset,
          logging: console.log, // Enable logging
        }),
        Positions.count({
          include: [
            {
              model: Company,
              required: true,
              where: companyFilters,
            },
          ],
          where:whereClause,
          logging: console.log, // Enable logging
        })
      ]);
  
      const pages = Math.ceil(totalRecords / limit);
      res.status(200).json({ totalRecords: totalRecords, pages: pages, data: [...job] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
