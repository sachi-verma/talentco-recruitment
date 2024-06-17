const db = require("../Models/db");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const User = require("../Models/userDetails");
const Interview = require("../Models/interviewSchedule");
const {sendMail }= require("../Controllers/emailController");

Position.hasMany(Candidate, { foreignKey: "position" });
Candidate.belongsTo(Position, { foreignKey: "position" });

Company.hasMany(Position, { foreignKey: "company_id" });
Position.belongsTo(Company, { foreignKey: "company_id" });

Candidate.hasMany(Interview, { foreignKey: "candidate_id" });
Interview.belongsTo(Candidate, { foreignKey: "candidate_id" });

User.hasMany(Position, { foreignKey: "recruiter_assign" });
Position.belongsTo(User, { foreignKey: "recruiter_assign" });

exports.getCandidates = async (req, res) => {
  try {
    const id = req.query.id;
    // const candidates = await Candidate.findAll({
    //   attributes: ["id", "candidate", "sourcing_status"],
    //   include: [
    //     {
    //       model: Position,
    //       required: true,
    //       attributes: ["company_id", "position", "location"],
    //       include: [
    //         {
    //           model: Company,
    //           required: true,
    //           attributes: ["company_name"],
    //         },
    //         {
    //           model: User,
    //           required: true,
    //           attributes: ["name"],
    //         },
    //       ],
    //     },
    //   ],
    //   where: {
    //     sourcing_status: {
    //       [Op.notIn]: ["Rejected", "Confirmation Pending"],
    //     },
    //   },
    // });
    const candidates = await Candidate.findOne({attributes:['candidate', 'candidate_email'],where:{id:id}});

    let candidate_email = candidates.candidate_email;
    let candidate_name = candidates.candidate;
    try {
        await sendMail({
          to: candidate_email,
          subject: `Interview Details Updated for Candidate ID: ${id}`,
          text: `Dear, ${candidate_name}!  Your interview details have been scheduled.`
        });
      } catch (mailError) {
        console.error('Error sending notification email:', mailError);
        return res.status(500).json({ error: 'Failed to send notification email' });
      }
    

    res.json(candidates);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getInterviewSchedule = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

    const userId = req.query.id; 

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const {
        candidate,
        company,
        position
    }= filter;

    console.log(filter);

    const report = await Interview.findAll({
      include: [
        {
          model: Candidate,
          required: true,
          //attributes: ["candidate"],
          include: [
            {
              model: Position,
              required: true,
             // attributes: ["company_id", "position", "location"],
              include: [
                {
                  model: Company,
                  required: true,
                 // attributes: ["company_name"],
                },
                {
                  model: User,
                  required: true,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset
    });
    res
      .status(200)
      .json({
        message: "interview schedule fetched successfully",
        Interview: report,
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.addInterviewSchedule = async (req, res) => {
  try {
    const {
      id,
      candidate_id,
      interview_round,
      interview_mode,
      interview_date,
      interview_time,
      interview_location,
      interview_link,
      interview_status,
      interview_remarks,
      interview_done,
    } = req.body;

    // // Define the required fields for validation
    // const requiredFields = ['id', 'candidate', 'interview_round', 'interview_mode', 'interview_date', 'interview_time', 'interview_location', 'interview_link', 'interview_status', 'interview_remarks', 'interview_done'];

    // // Validate the request body
    // for (let field of requiredFields) {
    //     if (!req.body.hasOwnProperty(field) || req.body[field] === null || req.body[field] === '') {
    //         console.error(`Missing or empty field: ${field} in report:`, req.body);
    //         return res.status(400).json({ error: `Missing or empty fields detected` });
    //     }
    // }

    const report = await Interview.create({
      id,
      candidate_id,
      interview_round,
      interview_mode,
      interview_date,
      interview_time,
      interview_location,
      interview_link,
      interview_status,
      interview_remarks,
      interview_done,
    });

    res.status(200).json({ message: "Interview created successfully", report });
  } catch (error) {
    console.error("Error adding interview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editInterviewSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      interview_round,
      interview_mode,
      interview_date,
      interview_time,
      interview_location,
      interview_link,
      interview_status,
      interview_remarks,
      interview_done,
    } = req.body;
    await Candidate.update(
      {
        interview_round,
        interview_mode,
        interview_date,
        interview_time,
        interview_location,
        interview_link,
        interview_status,
        interview_remarks,
        interview_done,
      },
      { where: { id: id } }
    );

    return res
      .status(200)
      .json({
        success: "interview details updated sucessfully",
        candidate: {
          id,
          interview_round,
          interview_mode,
          interview_date,
          interview_time,
          interview_location,
          interview_link,
          interview_status,
          interview_remarks,
          interview_done,
        },
      });
  } catch (error) {
    console.error("Error updating interview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.bulkInterviewSchedule = async (req, res) => {
  try {
    const interviewData = req.body; // Assuming the frontend sends an array of report objects
    console.log("=====>>>>>");
    if (!Array.isArray(interviewData) || interviewData.length === 0) {
      console.error("No interview data provided");
      return res.status(400).json({ error: "No interview data provided" });
    }

    // // Define the required fields for validation
    // const requiredFields = ['id', 'candidate', 'interview_round', 'interview_mode', 'interview_date', 'interview_time', 'interview_location', 'interview_link', 'interview_status', 'interview_remarks', 'interview_done'];

    // // Validate each report object
    // for (let report of interviewData) {
    //     for (let field of requiredFields) {
    //         if (!report.hasOwnProperty(field) || report[field] === null || report[field] === '') {
    //             console.error(`Missing or empty field: ${field} in report:`, report);
    //             return res.status(400).json({ error: `Missing or empty fields detected` });
    //         }
    //     }
    // }

    const createdReports = await Interview.bulkCreate(interviewData);

    if (!createdReports || createdReports.length === 0) {
      console.error("No interview schedule created");
      return res.status(400).json({ error: "No interview schedule created" });
    }

    res
      .status(200)
      .json({
        message: "Interview schedule created successfully",
        reports: createdReports,
      });
  } catch (error) {
    console.error("Error creating Interview Schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.candidateExist = async (req, res) => {
  try {
    const id = req.query.id;

    const candidate = await Interview.findOne({ where: { candidate_id: id } });
    if (candidate) {
      return res
        .status(404)
        .json({
          error: "This candidate already been scheduled for interview !",
          id,
        });
    } else {
      return res.status(200).json({ success: "Ready to be scheduled", id });
    }
  } catch (error) {
    console.error("Error creating Interview Schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateInterviewDetails = async (req, res) => {
    try {
      let id = req.params.id;
      id = parseInt(id);
      const {
        interview_round,
        interview_date,
        interview_mode,
        interview_time,
        interview_location,
        //interview_status,
        interview_remarks,
       // interview_done,
        recruiter_id,
      } = req.body;
  
      let thedate = new Date();
      let updated_at = thedate.toISOString().split("T")[0];
  
      // Construct the update object dynamically
      const updateFields = {};
      if (interview_round !== undefined) updateFields.interview_round = interview_round;
      if (interview_date !== undefined) updateFields.interview_date = interview_date;
      if (interview_mode !== undefined) updateFields.interview_mode = interview_mode;
      if (interview_time !== undefined) updateFields.interview_time = interview_time;
      if (interview_location !== undefined) updateFields.interview_location = interview_location;
      //if (interview_status !== undefined) updateFields.interview_status = interview_status;
      if (interview_remarks !== undefined) updateFields.interview_remarks = interview_remarks;
      //if (interview_done !== undefined) updateFields.interview_done = interview_done;
      //if (scheduled_date !== undefined) updateFields.scheduled_date = scheduled_date;
      if (recruiter_id !== undefined) updateFields.updated_by = recruiter_id;
      updateFields.updated_at = updated_at;
  
      const candidate = await Interview.update(updateFields, {
        where: { candidate_id:id }
      });
  
      if (candidate[0] > 0) {
        return res.status(200).json({ success: "updated successfully", id });
      } else {
        return res.status(404).json({ error: "cannot find", id });
      }
  
    } catch (error) {
      console.error("Error updating Interview Schedule:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  