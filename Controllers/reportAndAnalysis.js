const db = require("../Models/db");
const { Op } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const User = require("../Models/userDetails");

sourcingReportByRecruiter.belongsTo(User, { foreignKey: "recruiter_id" });
User.hasMany(sourcingReportByRecruiter, { foreignKey: "recruiter_id" });

exports.reportAndAnalysis = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

   // const userid = req.query.id;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const { recruiterName, fromDate, toDate } = filter;
    
    const whereClause = {};
    const recruiterFilter = {};

    if (fromDate && toDate) {
        let theDate = parseInt(toDate.split("-")[2]) + 1;
        let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
        whereClause.sent_to_client_date = {
          [Op.between]: [fromDate, newDate],
        };
      } else if (fromDate) {
        whereClause.sent_to_client_date = {
          [Op.gte]: fromDate,
        };
      } else if (toDate) {
        whereClause.sent_to_client_date = {
          [Op.lte]: toDate,
        };
      }
  
      if(recruiterName) recruiterFilter.name = { [Op.like]: `%${recruiterName}%` };

     

        // console.log(userid);

        // const user =await User.findByPk(userid);
        // if(!user){
        //      console.log("User not found");
        // }
        // console.log("=========>>>>>>>>",user.name);

    const result = await sourcingReportByRecruiter.findAll({
      include: [{
        model: User,
        required: true,
        attributes:["name"],
        where:recruiterFilter
      }],

      where: whereClause,
      limit,
      offset
    });

    // const data = result[0].dataValues;
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
