const db = require("../Models/db");
const { Sequelize } = require("sequelize");
const Position = require("../Models/allPositions");
const Candidates = require("../Models/allCandidates");
const Users = require("../Models/userDetails");
const excel = require("exceljs");
const Roles = require("../Models/roles");
const assignRecruiter = require("../Models/assignRecruiter");
const Company = require("../Models/companyDetails");

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

Users.hasMany(Candidates, { foreignKey: "created_by" });
Candidates.belongsTo(Users, { foreignKey: "created_by" });

exports.getDashBoradReport = async (req, res) => {
  try {
    const whereClause = {
      position_status: "Open",
    };

    const result = await Position.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_open_positions"],
        [Sequelize.fn("SUM", Sequelize.col("cv_sent")), "total_cv_sent"],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_shortlisted")),
          "total_cv_shortlisted",
        ],
        [Sequelize.fn("SUM", Sequelize.col("cv_backout")), "total_cv_backout"],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_interviewed")),
          "total_cv_interviewed",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_rejected_post_interview")),
          "total_cv_rejected_post_interview",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_feedback_pending")),
          "total_cv_feedback_pending",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_final_selection")),
          "total_cv_final_selection",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_offer_letter_sent")),
          "total_cv_offer_letter_sent",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_final_join")),
          "total_cv_final_join",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_confirmation_pending")),
          "total_cv_confirmation_pending",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_screened")),
          "total_cv_screened",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_rejected")),
          "total_cv_rejected",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("cv_interview_scheduled")),
          "total_cv_interview_scheduled",
        ],
      ],
      where: whereClause,
    });

    const data = result[0].dataValues;
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNewReports = async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    let recruiterFilter = {};

    if (user) {
      role_id = user.role_id;
      console.log("========>", role_id, user);

      if (role_id) {
        role = await Roles.findOne({ where: { id: role_id } });
        console.log("=========>>>>>>>>>>>>>>", role);

        if (
          role &&
          (role.role_name === "Recruiter" || role.role_name === "Team Lead")
        ) {
          recruiterFilter.created_by = userId;
        }
      }
    }
    const totalposition = await Position.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_open_positions"],
      ],
      where: { position_status: "Open" },
    });

    const statusMappings = [
      { status: "Sent To Client", key: "total_cv_sent" },
      { status: "CV Rejected", key: "total_cv_rejected" },
      { status: "Shortlisted", key: "total_cv_shortlisted" },
      { status: "Interview Scheduled", key: "total_cv_interview_scheduled" },
      { status: "Interview Done", key: "total_cv_interviewed" },
      {
        status: "Rejected Post Interview",
        key: "total_cv_rejected_post_interview",
      },
      { status: "Final Selection", key: "total_cv_final_selection" },
      { status: "Offer Letter Sent", key: "total_cv_offer_letter_sent" },
      { status: "Final Joining", key: "total_cv_final_join" },
      {
        status: "Interview Feedback Pending",
        key: "total_cv_feedback_pending",
      },
      { status: "Backout", key: "total_cv_backout" },
    ];
    const totalOpenPositions =
      totalposition[0]?.get("total_open_positions") || 0;

    let report = {};
    report.total_open_positions = totalOpenPositions;
    for (let mapping of statusMappings) {
      let candidates = await Candidates.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("candidate_status")), "count"],
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
              //"recruiter_assign",
              "min_experience",
              "max_experience",
              "min_ctc",
              "max_ctc",
            ],
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name"],
              },
              // {
              //   model: assignRecruiter,
              //   required:  true,
              //   attributes: ["recruiter_id"],
              //   where: recruiterFilter,
              //   include: [
              //     {
              //       model: Users,
              //       attributes: ["name"],
              //     },
              //   ],
              // },
            ],
          },
          {
            model: Users,
            required: true,
            attributes: ["name"],
          },
        ],
        where: { candidate_status: mapping.status, ...recruiterFilter },
      });

      // Extract the count from the query result
      const count = candidates[0]?.get("count") || 0;
      //console.log(candidates);
      report[mapping.key] = count;
    }

    //console.log("================================>> sent to client", report);
    res.status(200).json(report);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNewReporter = async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    let recruiterFilter = {};

    if (user) {
      role_id = user.role_id;
      console.log("========>", role_id, user);

      if (role_id) {
        role = await Roles.findOne({ where: { id: role_id } });
        console.log("=========>>>>>>>>>>>>>>", role);

        if (
          role &&
          (role.role_name === "Recruiter" || role.role_name === "Team Lead")
        ) {
          recruiterFilter.created_by = userId;
        }
      }
    }
    const totalposition = await Position.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_open_positions"],
      ],
      where: { position_status: "Open" },
    });

    const statusMappings = [
      { status: "Sent To Client", key: "total_cv_sent" },
      { status: "CV Rejected", key: "total_cv_rejected" },
      { status: "Shortlisted", key: "total_cv_shortlisted" },
      { status: "Interview Scheduled", key: "total_cv_interview_scheduled" },
      { status: "Interview Done", key: "total_cv_interviewed" },
      {
        status: "Rejected Post Interview",
        key: "total_cv_rejected_post_interview",
      },
      { status: "Final Selection", key: "total_cv_final_selection" },
      { status: "Offer Letter Sent", key: "total_cv_offer_letter_sent" },
      { status: "Final Joining", key: "total_cv_final_join" },
      {
        status: "Interview Feedback Pending",
        key: "total_cv_feedback_pending",
      },
      { status: "Backout", key: "total_cv_backout" },
    ];
    const totalOpenPositions =
      totalposition[0]?.get("total_open_positions") || 0;

    let report = {};
    report.total_open_positions = totalOpenPositions;
    for (let mapping of statusMappings) {
      let candidates = await Candidates.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("candidate_status")), "count"],
          "candidate_status",
        ],

        where: { candidate_status: mapping.status, ...recruiterFilter },
        group: ["candidate_status"],
      });

      // Extract the count from the query result
      const count = candidates[0]?.get("count") || 0;
      //console.log(candidates);
      report[mapping.key] = count;
    }

    //console.log("================================>> sent to client", report);
    res.status(200).json(report);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
