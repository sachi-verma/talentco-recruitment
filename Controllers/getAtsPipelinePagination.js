// new controller

const db = require("../Models/db");
const { Op } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");

exports.getAtsPipelinePagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number
    
    // const candidateName = req.query.candidateName;
    // const companyName = req.query.companyName;
    // //const position = req.query.position;
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate;

    const filter = req.query.filter ? JSON.parse(req.query.filter):"";

    console.log(filter);  


    const {candidate, email, mobile, status, position, company, location, fromDate, toDate}= filter;

    const whereClause = {
      sourcing_status: "Sent To Client",
    };
    if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };
    if (email) whereClause.candidate_email = { [Op.like]: `%${candidateEmail}%` };
    if (mobile) whereClause.candidate_phone = { [Op.like]: `%${candidateNumber}%` };
    if (location) whereClause.candidate_location = { [Op.like]: `%${location}%` };
    if (status) whereClause.candidate_status = { [Op.like]: `%${status}%` };
    
    if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };

    const companyFilters={};
    if (company) companyFilters.company_name = { [Op.like]: `%${company}%` };
    const positionFilters={};
    if (position) positionFilters.position = { [Op.like]: `%${position}%` };
    

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

    const [report, totalRecords] = await Promise.all([
      Candidate.findAll({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
          "candidate_email",
          "candidate_location",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_qualification",
          "candidate_gender",
          "cv_sourced_from",
          "relevant",
          "candidate_status",
          "remarks",
          "created_at",
          "updated_at",
        ],
        include: [
          {
            model: Position, 
            required: true,
            where:positionFilters,
            attributes: [
              "id",
              "company_id",
              "position",
              "location",
              "experience",
              "min_ctc",
              "max_ctc",
            ],
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name"],
                where: companyFilters,
              },
            ],
          },
        ],
        where: whereClause,
        // parameters
  
        limit,
        offset,
      }),
      Candidate.count({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
          "candidate_email",
          "candidate_location",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_qualification",
          "candidate_gender",
          "cv_sourced_from",
          "relevant",
          "candidate_status",
          "remarks",
          "created_at",
          "updated_at",
        ],
        include: [
          {
            model: Position,
            required: true,
            attributes: [
              "id",
              "company_id",
              "position",
              "location",
              "experience",
              "min_ctc",
              "max_ctc",
            ],
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name"],
                where: companyFilters,
              },
            ],
          },
        ],
        where:  whereClause,
        // parameters
  
       
      })

    ]);

    // const report = await Candidate.findAll({
    //   attributes: [
    //     "id",
    //     "candidate",
    //     "position",
    //     "candidate_phone",
    //     "candidate_email",
    //     "candidate_location",
    //     "candidate_experience",
    //     "candidate_current_ctc",
    //     "candidate_qualification",
    //     "candidate_gender",
    //     "cv_sourced_from",
    //     "relevant",
    //     "candidate_status",
    //     "remarks",
    //     "created_at",
    //     "updated_at",
    //   ],
    //   include: [
    //     {
    //       model: Position,
    //       required: true,
    //       attributes: [
    //         "id",
    //         "company_id",
    //         "position",
    //         "location",
    //         "experience",
    //         "min_ctc",
    //         "max_ctc",
    //       ],
    //       include: [
    //         {
    //           model: Company,
    //           required: true,
    //           attributes: ["company_name"],
    //         },
    //       ],
    //     },
    //   ],
    //   where: {
    //     sourcing_status: "Sent To Client",
    //     ...candidateNameFilter,
    //     ...companyNameFilter,
    //     ...positionFilter,
    //     ...(startDate || endDate ? { created_at: dateFilter } : {}),
    //   },
    //   // parameters

    //   limit,
    //   offset,
    // });
   
    let records = report.length;

    const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
    res.status(200).json({
      message: "candidates fetched successfully",
      totalRecords: filter? records: totalRecords,
      pages: pages,
      Candidates: report,

    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
