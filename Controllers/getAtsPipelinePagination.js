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

    //console.log(page, limit, offset);

    const candidateName = req.query.candidateName;
    const companyName = req.query.companyName;
    const position = req.query.position;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    //console.log(candidateName, companyName, position);

    // Define the filters
    const candidateNameFilter = candidateName
      ? { candidate: { [Op.like]: `%${candidateName}%` } }
      : {};
    const companyNameFilter = companyName
      ? { "$Position.Company.company_name$": { [Op.like]: `%${companyName}%` } }
      : {};
    const positionFilter = position
      ? { "$Position.Position$": { [Op.like]: `%${position}%` } }
      : {};

    console.log(startDate, endDate);
    // Date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      dateFilter[Op.lte] = new Date(endDate);
    }

    const report = await Candidate.findAll({
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
            },
          ],
        },
      ],
      where: {
        sourcing_status: "Sent To Client",
        ...candidateNameFilter,
        ...companyNameFilter,
        ...positionFilter,
        ...(startDate || endDate ? { created_at: dateFilter } : {}),
      },
      // parameters

      limit,
      offset,
    });
    res.status(200).json({
      message: "candidates fetched successfully",
      Candidates: report,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
