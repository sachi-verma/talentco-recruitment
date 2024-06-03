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

    const position = req.query.position;
    const companyName = req.query.companyName;
    const location = req.query.location;
    const industryName = req.query.industryName;
    const assignRecruiter = req.query.assignRecruiter;
 
    const companyFilters = {};
    if (companyName) {
      companyFilters.company_name = { [Op.like]: `%${companyName}%` };
    }
    if (industryName) {
      companyFilters.industry = { [Op.like]: `%${industryName}%` };
    }

    const positionFilter = position
      ? { position: { [Op.like]: `%${position}%` } }
      : {};

    const locationFilter = location
      ? { location: { [Op.like]: `%${location}%` } }
      : {};

    const job = await Positions.findAll({
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
    });
    
    const totalRecords= job.length;
    const pages = Math.floor(totalRecords/limit);
    console.log(totalRecords,pages);
    res.status(200).json({totalRecords:totalRecords,pages:pages, data:[...job] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
