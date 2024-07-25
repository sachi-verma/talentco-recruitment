const db = require("../Models/db");
const { Sequelize, INTEGER, where } = require("sequelize");
const { Op } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const User = require("../Models/userDetails");
const Interview = require("../Models/interviewSchedule");
const { sendMail } = require("../Controllers/emailController");
const Status = require("../Models/statusHistory");
const Users = require("../Models/userDetails");
const Roles = require("../Models/roles");
const assignRecruiter = require("../Models/assignRecruiter");
const InterviewHistory = require("../Models/interviewHistory");
const InterviewStatus = require("../Models/interviewStatusHistory");
const excel = require("exceljs");
const e = require("express");

// assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
// Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

Position.hasMany(Candidate, { foreignKey: "position" });
Candidate.belongsTo(Position, { foreignKey: "position" });

Company.hasMany(Position, { foreignKey: "company_id" });
Position.belongsTo(Company, { foreignKey: "company_id" });

Candidate.hasMany(Interview, { foreignKey: "candidate_id" });
Interview.belongsTo(Candidate, { foreignKey: "candidate_id" });

Candidate.hasMany(InterviewHistory, { foreignKey: "candidate_id" });
InterviewHistory.belongsTo(Candidate, { foreignKey: "candidate_id" });

User.hasMany(Position, { foreignKey: "recruiter_assign" });
Position.belongsTo(User, { foreignKey: "recruiter_assign" });

Users.hasMany(Candidate, { foreignKey: "created_by" });
Candidate.belongsTo(Users, { foreignKey: "created_by" });

Users.hasMany(Interview, { foreignKey: "created_by" });
Interview.belongsTo(Users, { foreignKey: "created_by" });

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
    const candidates = await Candidate.findOne({
      attributes: ["candidate", "candidate_email"],
      where: { id: id },
    });

    let candidate_email = candidates.candidate_email;
    let candidate_name = candidates.candidate;
    try {
      await sendMail({
        to: candidate_email,
        subject: `Interview Details Updated for Candidate ID: ${id}`,
        text: `Dear, ${candidate_name}!  Your interview details have been scheduled.`,
      });
    } catch (mailError) {
      console.error("Error sending notification email:", mailError);
      return res
        .status(500)
        .json({ error: "Failed to send notification email" });
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
    const whereClause = {};
    const candidateFilter = {};
    const positionFilter = {};
    const companyFilter = {};

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const {
      candidate,
      company,
      position,
      interview_round,
      interview_date,
      interview_status,
      orderBy, 
      orderDirection,
      fromDate,
      toDate,
      interview_location,
      interview_done,
    } = filter;

    // Log filter values
    console.log("Filter Values: ", filter);

    if (candidate) {
      candidateFilter.candidate = { [Op.like]: `%${candidate}%` };
    }
    if (company) {
      companyFilter.company_name = { [Op.like]: `%${company}%` };
    }
    if (position) {
      positionFilter.position = { [Op.like]: `%${position}%` };
    }

    if (interview_round) {
      whereClause.interview_round = { [Op.like]: `%${interview_round}%` };
    }
    if (interview_status) {
      whereClause.interview_status = { [Op.like]: `%${interview_status}%` };
    }
    // if (interview_done ) {
    //   whereClause.interview_done = { [Op.like]: `%${interview_done}%` };
    // }

    if (interview_done && interview_done!=="" && interview_done !== "All") {
      whereClause.interview_done = { [Op.like]: `%${interview_done}%` };
    } else if (!interview_done || interview_done==="") {
      whereClause.interview_done = "In Progress";
    }

    // if (candidate !== undefined)
    //   candidateFilter.candidate = { [Op.like]: `%${candidate}%` };
    // if (company !== undefined)
    //   companyFilter.company_name = { [Op.like]: `%${company}%` };
    // if (position !== undefined)
    //   positionFilter.position = { [Op.like]: `%${position}%` };
    // if (interview_round !== undefined)
    //   whereClause.interview_round = interview_round;
    // if (interview_date !== undefined)
    //   whereClause.interview_date = { [Op.like]: `%${interview_date}%` };
    // if (interview_status !== undefined)
    //   whereClause.interview_status = { [Op.like]: `%${interview_status}%` };
    // if (interview_location !== undefined)
    //   whereClause.interview_location = { [Op.like]: `%${interview_location}%` };
    // if (interview_done !== undefined)
    //   whereClause.interview_done = { [Op.like]: `%${interview_done}%` };

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.scheduled_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      whereClause.scheduled_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.scheduled_date = {
        [Op.lte]: newDate,
      };
    }

    // Log whereClause and other filters
    // console.log("Where Clause: ", whereClause);
    // console.log("Candidate Filter: ", candidateFilter);
    // console.log("Position Filter: ", positionFilter);
    // console.log("Company Filter: ", companyFilter);

    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    const recruiterFilter = {};

    if (user) {
      role_id = user.role_id;

      role = await Roles.findOne({ where: { id: role_id } });
      console.log("Role Name: ", role.role_name);

      if (
        role &&
        (role.role_name === "Recruiter" || role.role_name === "Team Lead")
      ) {
        whereClause.created_by = userId;
      }
    }

    let order = [["scheduled_date", "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        scheduled_date: "scheduled_date",  
        candidate: "candidate",
        company_name: "company_name",
        position: "position", 
        round:"interview_round"
      };
       
      if (validColumns[orderBy]) {
        order = [[Sequelize.literal(validColumns[orderBy]), orderDirection]];
      }
    }

    const [report, totalReports] = await Promise.all([
      await Interview.findAll({
        include: [
          {
            model: Candidate,
            required: true,
            where: candidateFilter,
            include: [
              {
                model: Position,
                required: true,
                //attributes: ["id", "position", "location", "company_id"],
                where: positionFilter,
                include: [
                  {
                    model: Company,
                    required: true,
                    where: companyFilter,
                  },
                ],
              },
            ],
          },
          // {
          //   model: User,
          //   required: true,
          //   attributes: ["name", "email", "phone"],
          // },
        ],
        limit,
        offset,
        where: whereClause,
        order: order,
      }),

      await Interview.count({
        include: [
          {
            model: Candidate,
            required: true,
            where: candidateFilter,
            include: [
              {
                model: Position,
                required: true,
                where: positionFilter,
                include: [
                  {
                    model: Company,
                    required: true,
                    where: companyFilter,
                  },
                ],
              },
            ],
          },
          // {
          //   model: User,
          //   required: true,
          //   attributes: ["name", "email", "phone"],
          // },
        ],
        where: whereClause,
      }),
    ]);

    let records = report.length;

    // Log the results of the query
    // console.log("Records: ", records);
    // console.log("Total Reports: ", totalReports);

    const pages = Math.ceil(totalReports / limit);
    res.status(200).json({
      message: "interview schedule fetched successfully",
      totalRecords: totalReports,
      pages: pages,
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

    return res.status(200).json({
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

    res.status(200).json({
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
      return res.status(404).json({
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
      scheduled_date,
      recruiter_id,
    } = req.body;

    let thedate = new Date();
    let updated_at = thedate.toISOString().split("T")[0];

    // Construct the update object dynamically
    const updateFields = {};
    if (interview_round !== undefined)
      updateFields.interview_round = interview_round;
    if (interview_date !== undefined)
      updateFields.interview_date = interview_date;
    if (interview_mode !== undefined)
      updateFields.interview_mode = interview_mode;
    if (interview_time !== undefined)
      updateFields.interview_time = interview_time;
    if (interview_location !== undefined)
      updateFields.interview_location = interview_location;
    //if (interview_status !== undefined) updateFields.interview_status = interview_status;
    if (interview_remarks !== undefined)
      updateFields.interview_remarks = interview_remarks;
    //if (interview_done !== undefined) updateFields.interview_done = interview_done;
    //if (scheduled_date !== undefined) updateFields.scheduled_date = scheduled_date;
    if (recruiter_id !== undefined) updateFields.updated_by = recruiter_id;
    updateFields.updated_at = updated_at;

    let round;
    if (interview_round !== undefined) {
      round = interview_round;
    }
    console.log("==========>>>>>> id", id);
    let history;
    let roundExist = await InterviewHistory.findOne({
      where: { candidate_id: id, interview_round: round },
    });
    if (roundExist) {
      history = await InterviewHistory.update(updateFields, {
        where: { candidate_id: id, interview_round: round },
      });
    } else {
      updateFields.candidate_id = id;
      updateFields.created_at = new Date();
      updateFields.created_by = recruiter_id;
      updateFields.scheduled_date =
        scheduled_date !== undefined ? scheduled_date : null;
      history = await InterviewHistory.create(updateFields);
    }

    const candidate = await Interview.update(updateFields, {
      where: { candidate_id: id },
    });

    const candidatedetails = await Candidate.findOne({
      include: [
        {
          model: Position,
          required: true,
          attributes: [
            "id",
            "company_id",
            "position",
            "location",
            "min_experience",
            "max_experience",
            "min_ctc",
            "max_ctc",
          ],
          include: [
            {
              model: Company,
              required: true,
              attributes: ["company_name", "address"],
            },
          ],
        },
        {
          model: Users,
          required: true,
          attributes: ["name", "phone"],
        },
      ],
      where: { id: id },
    });
    let candidate_email = candidatedetails.candidate_email;
    let candidate_name = candidatedetails.candidate;
    let position = candidatedetails.Position.position;
    let company = candidatedetails.Position.Company.company_name;
    let companyaddress = candidatedetails.Position.Company.address;
    let contactperson = candidatedetails.User.name;
    let contactpersonphone = candidatedetails.User.phone;
    let interviewdate = interview_date
      ? interview_date.split("-").reverse().join("-")
      : "";

    if (candidate[0] > 0) {
      try {
        await sendMail({
          to: candidate_email,
          subject: `Interview Details Updated !!`,
          text: `Dear, ${candidate_name}! 

Greetings from TalentCo HR Services LLP!

Your interview details has been updated with  ${company} on ${interviewdate} at ${interview_time} for the post of ${position}.
${interview_mode === "In Person" ? `Company Address: ${companyaddress}`: `${interview_location.includes("https") ? `Link` : `Interview Location`}: ${interview_location}`}.        
Contact Person: ${contactperson}, ${contactpersonphone} 
              
Try to ${interview_location.includes("https")? `Join 5 minutes`: `reach 15 minutes`} before the scheduled time to avoid any last-minute rush.  
                                                                                                                                                                                                                                                        
Kindly send your acknowledgment as a confirmation to this mail. 
              
All the very best.

Regards,
TalentCo HR Services`,
        });
      } catch (mailError) {
        console.error("Error sending notification email:", mailError);
        //return res.status(500).json({ error: 'Failed to send notification email' });
      }
      return res
        .status(200)
        .json({ success: "updated successfully", id, candidatedetails });
    } else {
      return res.status(404).json({ error: "cannot find any changes", id });
    }
  } catch (error) {
    console.error("Error updating Interview Schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateInterviewStatus = async (req, res) => {
  try {
    const candidate_id = req.params.id;
    const { interview_status, recruiter_id } = req.body;

    let thedate = new Date();
    let updated_at = thedate.toISOString().split("T")[0];
    let interview_done = "Interview Done";
    let final_selection = "Final Selection";
    let backout = "Backout";

    const iscandidate = await Interview.findOne({
      where: { candidate_id: candidate_id },
    });
    if (!iscandidate) {
      return res.status(404).json({ error: "Candidate not found!!" });
    } else {
      await Interview.update(
        { interview_status, updated_by: recruiter_id, updated_at: updated_at },
        { where: { candidate_id: candidate_id } }
      );

      if (interview_status === "Final Selection") {
        await Candidate.update(
          { candidate_status: final_selection, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history
        await Status.create({
          candidate_id: candidate_id,
          candidate_status: interview_done,
          status_date: updated_at,
          created_by: recruiter_id,
        });

        await Status.create({
          candidate_id: candidate_id,
          candidate_status: final_selection,
          status_date: updated_at,
          created_by: recruiter_id,
        });
      } else if (interview_status === "Rejected Post Interview") {
        await Candidate.update(
          { candidate_status: interview_status, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history
        await Status.create({
          candidate_id: candidate_id,
          candidate_status: interview_done,
          status_date: updated_at,
          created_by: recruiter_id,
        });

        await Status.create({
          candidate_id: candidate_id,
          candidate_status: interview_status,
          status_date: updated_at,
          created_by: recruiter_id,
        });
      } else if (interview_status === "Backout") {
        await Candidate.update(
          { candidate_status: backout, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history

        await Status.create({
          candidate_id: candidate_id,
          candidate_status: backout,
          status_date: updated_at,
          created_by: recruiter_id,
        });
      } else if (interview_status === "Interview Feedback Pending") {
        await Candidate.update(
          { candidate_status: interview_status, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history
        await Status.create({
          candidate_id: candidate_id,
          candidate_status: interview_done,
          status_date: updated_at,
          created_by: recruiter_id,
        });

        await Status.create({
          candidate_id: candidate_id,
          candidate_status: interview_status,
          status_date: updated_at,
          created_by: recruiter_id,
        });
      } else if ( interview_status === "Hold Post Interview"){
        await Candidate.update(
          { candidate_status: interview_status, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history
        await Status.findOrCreate({
          where: {
            candidate_id: candidate_id,
            candidate_status: interview_done,
            status_date: updated_at,
            created_by: recruiter_id,
          },
          defaults: {
            candidate_id: candidate_id,
            candidate_status: interview_done,
            status_date: updated_at,
            created_by: recruiter_id,
          },
        });

        await Status.findOrCreate({
          where: {
            candidate_id: candidate_id,
            candidate_status: interview_status,
            status_date: updated_at,
            created_by: recruiter_id,
          },
          defaults: {
            candidate_id: candidate_id,
            candidate_status: interview_status,
            status_date: updated_at,
            created_by: recruiter_id,
          },
        });
      }else if ( interview_status === "Shortlisted Next Round"){
        await Candidate.update(
          { candidate_status: interview_status, status_date: updated_at, updated_by: recruiter_id },
          { where: { id: candidate_id } }
        );

        //creating a new status to add in status history
       
        await Status.findOrCreate({
          where: {
            candidate_id: candidate_id,
            candidate_status: interview_status,
            status_date: updated_at,
            created_by: recruiter_id,
          },
          defaults: {
            candidate_id: candidate_id,
            candidate_status: interview_status,
            status_date: updated_at,
            created_by: recruiter_id,
          },
        });
      }

      await InterviewStatus.create({
          candidate_id: candidate_id,
          interview_status: interview_status,
          created_by: updated_at,
          created_by: recruiter_id,
      })

      return res.status(200).json({
        success: "Interview status updated successfully !",
        candidate_id,
        interview_status,
      });
    }
  } catch (error) {
    console.error("Error updating Interview Schedule:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.markInterviewDone = async (req, res) => {
  try {
    const candidate_id = req.params.id;
    const { interview_done, recruiter_id } = req.body;
    let thedate = new Date();
    let updated_at = thedate.toISOString().split("T")[0];

    const iscandidate = await Interview.findOne({
      where: { candidate_id: candidate_id },
    });
    if (!iscandidate) {
      return res.status(404).json({ error: "Candidate not found!!" });
    } else {
      await Interview.update(
        { interview_done, updated_by: recruiter_id, updated_at: updated_at },
        { where: { candidate_id: candidate_id } }
      );
    }

    res.status(200).json({ success: `Interviews marked as ${interview_done}` });
  } catch (error) {
    console.error("Error updating Interview done:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPositionWiseCount = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const userId = req.query.id;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
    const download = req.query.download ? true : false;
    if (download) {
      limit = null;
      offset = null;
    }

    let {
      fromDate,
      toDate,
      company,
      position,
      orderBy,
      orderDirection,
      interview_status,
      recruiter
    } = filter;

    const positionFilter = {};
    const companyFilter = {};

    const user = await Users.findByPk(userId);
    let role_id;
    let role;

    if (user) {
      role_id = user.role_id;

      role = await Roles.findOne({ where: { id: role_id } });
      console.log("Role Name: ", role.role_name);

      if (
        role &&
        (role.role_name === "Recruiter" || role.role_name === "Team Lead")
      ) {
         recruiter = userId;
      }
    }

    if (company) {
      companyFilter.company_name = { [Op.like]: `%${company}%` };
    }

    if (position) {
      positionFilter.position = { [Op.like]: `%${position}%` };
    }

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      positionFilter.upload_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      positionFilter.upload_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      positionFilter.upload_date = {
        [Op.lte]: newDate,
      };
    }

    if(recruiter){
      whereClause.created_by= recruiter;
      }


    let order =[[Sequelize.literal("upload_date"), "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        upload_date: "upload_date",
        company_name: "company_name",
        position: "position",
      };

      if (validColumns[orderBy]) {
        order = [[Sequelize.literal(validColumns[orderBy]), orderDirection]];
      }
    }

    const report = await Interview.findAll({
      attributes: [
        [Sequelize.col("Candidate.Position.id"), "position_id"],
        [Sequelize.col("Candidate.Position.company_id"), "company_id"],
        [Sequelize.col("Candidate.Position.position"), "position_name"],
        [Sequelize.col("Candidate.Position.upload_date"), "upload_date"],
        [
          Sequelize.col("Candidate.Position.Company.company_name"),
          "company_name",
        ],
        [
          Sequelize.literal(`
        (
          SELECT COUNT(DISTINCT Interview.id)
          FROM interview_schedule AS Interview
          INNER JOIN all_candidates AS Candidate ON Candidate.id = Interview.candidate_id
          WHERE Candidate.position = position_id
          ${
            interview_status
              ? `AND Interview.interview_status = '${interview_status}'`
              : ""
          } 
          ${
            recruiter
              ? `AND Interview.created_by = '${recruiter}'`
              : ""
          } 
        )
      `),
          "interview_count",
        ],
      ],
      include: [
        {
          model: Candidate,
          attributes: [],
          required: true,
          include: [
            {
              model: Position,
              attributes: [],
              required: true,
              where: positionFilter,
              include: [
                {
                  model: Company,
                  attributes: [],
                  required: true,
                  where: companyFilter,
                },
              ],
            },
          ],
        },
      ],
      group: [
        "Candidate.Position.id",
        "Candidate.Position.company_id",
        "Candidate.Position.position",
        "Candidate.Position.upload_date",
        "Candidate.Position.Company.company_name",
      ],
      order: order,
      limit,
      offset,
    });
    if(download){
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("interviewpositonwisecount");

      // Add headers to the worksheet

      const headerRow = worksheet.addRow([
        "Sr. No.",
        "Upload Date",
        "Company Name",
        "Company Position",
        "Count"
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
      });

      // Add data rows to the worksheet
      report.forEach((re, index) => {
        worksheet.addRow([
          index + 1,
          re.getDataValue('upload_date'),
          re.getDataValue('company_name'),
          re.getDataValue('position_name'),
          re.getDataValue('interview_count'),
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_interviewpositionwisecount.xlsx`;

      // Save the workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Send the Excel file as a response
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.status(200).send(buffer);

    }else{
    const pages = Math.ceil(report.length / limit);
    res.status(200).json({
      msg: "Report fetched successfully !!",
      totalReports: report.length,
      pages: pages,
      report: report,
    })
  }
  } catch (error) {
    console.error("Error in getPositionWiseCount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getInterviewHistory = async (req, res) => {
  try {
    const id = req.params.id;
     const report= await InterviewHistory.findAll({
        include: [
          {
            model: Candidate,
            attributes: ['candidate', 'candidate_email'],
            required: true,
          }
        ],
       where:{candidate_id:id}
      });

    res.status(200).json({
      msg: "Interview History fetched successfully !!",
      report: report,
    });
    
  } catch (error) {
    console.error("Error getting interview history :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

};

exports.getInterviewStatusHistory = async (req, res)=>{
  try {
    const id = req.params.id;
     const report= await InterviewStatus.findAll({
       where:{candidate_id:id}
      });

    res.status(200).json({
      msg: "Interview status history fetched successfully !!",
      report: report,
    }); 
    
  } catch (error) {
    console.error("Error getting interview status history :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};