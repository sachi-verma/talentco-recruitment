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

    //const filter = JSON.parse(req.query.filter);


    const {position, company, location, gender, qualification, recruiterId}= req.query.filter;

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
//console.log(position);
    const positionFilter = position
      ? { position: { [Op.like]: `%${position}%` } }
      : {};

    const locationFilter = location
      ? { location: { [Op.like]: `%${location}%` } }
      : {};

      const genderFilter = gender?{gender_pref:{[Op.like]:`%${gender}%`}}:{};
      const qualificationFilter = qualification?{qualification:{[Op.like]:`%${qualification}%`}}:{};
      const recruiterIdFilter = recruiterId?{recruiter_assign:{[Op.like]:`%${recruiterId}%`}}:{};
      



      const [job, totalRecords] = await Promise.all([
        Positions.findAll({
          include: [
            {
              model: Company,
              required: true,
              where: companyFilters,
            },
          ],
          where: {
            ...positionFilter,
            ...locationFilter,
          },
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
          where: {
            ...positionFilter,
            ...locationFilter,
            ...genderFilter,
            ...qualificationFilter,
            ...recruiterIdFilter


          }
        })
      ]);
  
      const pages = Math.ceil(totalRecords / limit);
      res.status(200).json({ totalRecords: totalRecords, pages: pages, data: [...job] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
