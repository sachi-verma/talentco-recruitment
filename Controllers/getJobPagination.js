const db = require("../Models/db");
const Jobs = require("../Models/jobDetails");
const Positions = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const { Op } = require("sequelize");
const Users = require("../Models/userDetails");
 

exports.getJobByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; 

    const filter = req.query.filter ? JSON.parse(req.query.filter):"";

    console.log(filter);  


    const {position, company, location, gender, qualification, recruiterId, notAssigned, fromDate, toDate}= filter;

    // const position = req.query.position;
    // const companyName = req.query.companyName;
    // const location = req.query.location;
    // const industryName = req.query.industryName;
    //const assignRecruiter = req.query.assignRecruiter;

    //console.log(position, company, location, gender, qualification, recruiterId, notAssigned, fromDate, toDate);
 
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
    if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };
    if (notAssigned === "Not assigned") whereClause.recruiter_assign = null;

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split('-')[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, '0');
      whereClause.upload_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) { 
      whereClause.upload_date = {
        [Op.gte]:  fromDate,
      };
    } else if (toDate) {
      whereClause.upload_date = {
        [Op.lte]:  toDate,
      };
    }
  
    console.log('Where clause:', whereClause);
    console.log('Company filters:', companyFilters);


      const [job, totalRecords] = await Promise.all([
        Positions.findAll({
          attributes:{exclude:['recruiter_assign']},
          include: [
            {
              model: Company,
              required: true,
              where: companyFilters,
            },
            {
              model: Users,
              required: true,
              attributes:['name'],
            }
            
          ],
          where:whereClause,
          limit,
          offset,
           
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
           
        })
      ]);
      let records = job.length;

      const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
      res.status(200).json({ totalRecords: filter?records:totalRecords, pages: pages, data: [...job] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
