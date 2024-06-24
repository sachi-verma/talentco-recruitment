const db = require("../Models/db");
const { Sequelize, INTEGER } = require("sequelize");
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

const e = require("express");
 

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

Position.hasMany(Candidate, { foreignKey: "position" });
Candidate.belongsTo(Position, { foreignKey: "position" });

Company.hasMany(Position, { foreignKey: "company_id" });
Position.belongsTo(Company, { foreignKey: "company_id" });

Candidate.hasMany(Interview, { foreignKey: "candidate_id" });
Interview.belongsTo(Candidate, { foreignKey: "candidate_id" });

User.hasMany(Position, { foreignKey: "recruiter_assign" });
Position.belongsTo(User, { foreignKey: "recruiter_assign" });

Users.hasMany(Candidate, { foreignKey: 'created_by' });
Candidate.belongsTo(Users, { foreignKey: 'created_by' });

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
    const whereClause= { }

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const { candidate, company, position } = filter;

    console.log(filter);

    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    const recruiterFilter = {};

    if (user) {
      role_id = user.role_id;

      role = await Roles.findOne({ where: { id: role_id } });
      console.log(role.role_name);

      if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
        recruiterFilter.recruiter_id = userId;
      }
    }

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
                  model: assignRecruiter,
                  required:true, // Set to false if a position can have no recruiters assigned
                  attributes: ["recruiter_id"],
                  where: recruiterFilter,
                  include: [
                    {
                      model: Users,
                      attributes: ["name"], // Fetch recruiter names
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      where: whereClause,
    });
    let records = report.length;

    //console.log("=============>>> total", totalRecords);

    const pages = Math.ceil(filter ? records / limit : records / limit);
    res.status(200).json({
      message: "interview schedule fetched successfully",
      totalRecords: records,
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

    let round ;
    if (interview_round !== undefined){
        round = interview_round;
    }
console.log("==========>>>>>> id",id)
    let history;
    let roundExist =  await InterviewHistory.findOne({where:{candidate_id:id, interview_round:round }});
    if(roundExist) {
       history=  await InterviewHistory.update(updateFields, {where: { candidate_id: id, interview_round:round }});
    }
    else{
      updateFields.candidate_id=id; 
      updateFields.created_at= new Date();
      updateFields.created_by = recruiter_id;
      updateFields.scheduled_date=scheduled_date !== undefined ? scheduled_date : null;
      history=  await InterviewHistory.create(updateFields);
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
              "experience",
              "min_ctc",
              "max_ctc",
            ],
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name","address"],
                 
              },
               
          ]
      
  },
  {
    model: Users,
    required: true,
    attributes:["name", "phone"], 
  }
], 
      where:{id: id}
  });
   let candidate_email = candidatedetails.candidate_email;
   let candidate_name = candidatedetails.candidate;
   let position = candidatedetails.Position.position;
   let company = candidatedetails.Position.Company.company_name;
   let companyaddress = candidatedetails.Position.Company.address;
   let contactperson = candidatedetails.User.name;
   let contactpersonphone = candidatedetails.User.phone;

    if (candidate[0] > 0) {
      try {
        await sendMail({
          to: candidate_email,
          subject: `Interview Details Updated !!`,
          text: `Dear, ${candidate_name}! 

Greetings from TalentCo HR Services LLP!

Your interview Details has been updated with  ${company} i.e. ${interview_date} at  ${interview_time} for the post of ${position}.

${interview_mode==="In Person" ?`Company Address: ${companyaddress}`:`${interview_location.includes('https')? `Link`:`Interview Location` }: ${interview_location}`}.
            
Contact Person: ${contactperson}, ${contactpersonphone} 
              
Try to ${interview_location.includes('https')? `Join 5 minutes`:`reach 15 minutes` } before the scheduled time to avoid any last-minute rush.  
                                                                                                                                                                                                                                                        
Kindly send your acknowledgment as a confirmation to this mail. 
              
All the very best.

Regards,
Talent Co Hr Services`,
        });
      } catch (mailError) {
        console.error("Error sending notification email:", mailError);
        //return res.status(500).json({ error: 'Failed to send notification email' });
      }
      return res.status(200).json({ success: "updated successfully", id, candidatedetails });
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
          { candidate_status: final_selection, status_date: updated_at },
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
          { candidate_status: interview_status, status_date: updated_at },
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
          { candidate_status: backout, status_date: updated_at },
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
            { candidate_status: interview_status, status_date: updated_at },
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

      }

      return res
        .status(200)
        .json({
          success: "Interview status updated successfully !",
          candidate_id,
          interview_status,
        });
    }
  } catch (error) {
    console.error("Error updating Interview Schedule:", error);
    res.status(500).json({ error: "Internal Server Error" }, error);
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
    res.status(500).json({ error: "Internal Server Error" }, error);
  }
};
