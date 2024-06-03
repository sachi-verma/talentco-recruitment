const db = require("../Models/db");
const { Sequelize } = require("sequelize");
const Report = require("../Models/dailySourcingReport");
const Update = require("../Models/dailySourcingUpdate");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const AdminUpdate = require("../Models/dailyAdminUpdate");
const User = require("../Models/userDetails");
const { Op } = require("sequelize");



exports.getSourcingReportByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

    const candidateName = req.query.candidateName;
    const cv_sourced_from = req.query.cvFrom;
    const sourcing_status = req.query.sourcingStatus;
    const position = req.query.position;
    const filters = {};
    if (candidateName) {
      filters.candidate = { [Op.like]: `%${candidateName}%` };
    }
    if (cv_sourced_from) {
      filters.cv_sourced_from = { [Op.like]: `%${cv_sourced_from}%` };
    }
    if (sourcing_status) {
      filters.sourcing_status = { [Op.like]: `%${sourcing_status}%` };
    }

    const companyFilters = {};
    if (position) {
      companyFilters.position = { [Op.like]: `%${position}%` };
    }

    

    const report = await Candidate.findAll({
      attributes: [
        "id",
        "candidate",
        "position",
        "cv_sourced_from",
        "relevant",
        "sourcing_status",
        "remarks",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: Position,
          required: true,
          where: companyFilters,
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
      where: filters,
      limit,
      offset,
    });
    res
      .status(200)
      .json({ message: "Candidates fetched successfully", Candidates: report });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.getFilteredUpdateByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

    const update = await Update.findAll({ limit, offset });
    res.status(200).json(update);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.getAdminReportByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    // Build the where clause with the date filter
    const whereClause = {
      sourcing_status: "Sent To Client",
    };

    if (startDate && endDate) {
      whereClause.sourcing_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.sourcing_date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.sourcing_date = {
        [Op.lte]: new Date(endDate),
      };
    }

    // Step 1: Get the total count of unique positions and sourcing_date combinations
    const totalCountResult = await Candidate.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("sourcing_date")), "date"],
      ],
      where: whereClause,
      include: [
        {
          model: Position,
          required: true,
          attributes: ["id"],
        },
      ],
      group: [
        "Position.id",
        Sequelize.fn("DATE", Sequelize.col("sourcing_date")),
      ],
    });

    const totalCount = totalCountResult.length;

    // Step 2: Get the paginated data
    const report = await Candidate.findAll({
      attributes: [
        "position",
        [Sequelize.fn("DATE", Sequelize.col("sourcing_date")), "date"],
        [
          Sequelize.fn("COUNT", Sequelize.col("sourcing_status")),
          "sentToClientCount",
        ],
      ],
      where: whereClause,
      include: [
        {
          model: Position,
          required: true,
          attributes: [
            "id",
            "company_id",
            "position",
            "location",
            "recruiter_assign",
          ],
          include: [
            {
              model: Company,
              required: true,
              attributes: ["company_name"],
            },
            {
              model: User,
              required: true,
              attributes: ["name"],
            },
          ],
        },
      ],
      group: [
        "Candidates.position",
        Sequelize.fn("DATE", Sequelize.col("sourcing_date")),
        "Position.id",
        "Position.company_id",
        "Position.position",
        "Position.location",
        "Position.recruiter_assign",
        "Position.Company.company_name",
        "Position.User.name",
      ],
      limit,
      offset,
    });

    res.status(200).json({
      message: "Report fetched successfully",
      totalCount: totalCount,
      Candidates: report,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

