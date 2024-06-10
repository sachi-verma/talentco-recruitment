const db = require("../Models/db");
const Jobs = require("../Models/jobDetails");
const Positions = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const { Op } = require("sequelize");
const Users = require("../Models/userDetails");
const assignRecruiter = require("../Models/assignRecruiter");

Company.hasMany(Positions, { foreignKey: "company_id" });
Positions.belongsTo(Company, { foreignKey: "company_id" });
Positions.hasMany(assignRecruiter, { foreignKey: "position_id" });
assignRecruiter.belongsTo(Positions, { foreignKey: "position_id" });

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

exports.getJobByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const {
      position,
      company,
      location,
      gender,
      qualification,
      recruiterId,
      notAssigned,
      positionStatus,
      fromDate,
      toDate,
    } = filter;

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
    if (qualification)
      whereClause.qualification = { [Op.like]: `%${qualification}%` };

    if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };

    const assignRecruiterFilters = {};
    if (recruiterId)
      assignRecruiterFilters.recruiter_id =  recruiterId;

    if (notAssigned === "Not Assigned")
      assignRecruiterFilters.recruiter_id = null;
    // if (positionStatus)
    //   whereClause.position_status = { [Op.like]: `%${positionStatus}` };
    if (positionStatus) {
      whereClause.position_status = { [Op.like]: `%${positionStatus}%` };
    } else {
      whereClause.position_status = "Open";
    }

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.upload_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      whereClause.upload_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.upload_date = {
        [Op.lte]: toDate,
      };
    }

    console.log("Where clause:", whereClause);
    console.log("Company filters:", companyFilters);

    const [job, totalRecords] = await Promise.all([
      Positions.findAll({
        include: [
          {
            model: Company,
            required: true,
            where: companyFilters,
          },
          {
            model: assignRecruiter,
            required: recruiterId? true : false, // Set to false if a position can have no recruiters assigned
            attributes: ["recruiter_id"],
            where: assignRecruiterFilters,
            include: [
              {
                model: Users,
                attributes: ["name"], // Fetch recruiter names
              },
            ],
          },
        ],
        where: whereClause,
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
          {
            model: Users,

            attributes: ["name"],
          },
        ],
        where: whereClause,
      }),
    ]);
    let records = job.length;

    const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
    res.status(200).json({
      totalRecords: filter ? records : totalRecords,
      pages: pages,
      data: [...job],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.updatePositionStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { position_status } = req.body;

    await Positions.update({ position_status }, { where: { id: id } });

    return res.status(200).json({
      success: "Position status changed sucessfully",
      Position: { id, position_status },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
