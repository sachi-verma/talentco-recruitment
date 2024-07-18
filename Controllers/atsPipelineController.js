const db = require("../Models/db");
const { Op, DATE } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const interviewSchedule = require("../Models/interviewSchedule");
const { sendMail } = require("../Controllers/emailController");
const Interview = require("../Models/interviewSchedule");
const { assignRecruiter } = require("./assignRecruiterController");
const Users = require("../Models/userDetails");
const InterviewHistory = require("../Models/interviewHistory");

Users.hasMany(Candidate, { foreignKey: 'created_by' });
Candidate.belongsTo(Users, { foreignKey: 'created_by' });

exports.getAtsPipeline = async (req, res) => {
  try {
    const report = await Candidate.findAll({
      attributes: [
        "id",
        "candidate",
        "position",
        "candidate_phone",
        "candidate_email",
        "candidate_location",
        "candidate_experience",
        "candidate_ctc",
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
          ],
        },
      ],
      where: {
        // candidate_status: {
        //     [Op.ne]: 'sent to client'
        //     //Op is the object and ne stands for not equal
        // }
        sourcing_status: "Sent To Client",
      },
      // where: {
      //     candidate_status: {
      //       [Op.or]: ['Sent To Client', 'Shortlisted', 'Interview Done', 'Selected', 'Not Selected', 'Backout']
      //     }
      //   }
    });
    res
      .status(200)
      .json({ message: "candidates fetched successfully", Candidates: report });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.editAtsPipeline = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      candidate_phone,
      candidate_email,
      candidate_location,
      candidate_experience,
      candidate_current_ctc,
      candidate_qualification,
      candidate_gender,
      candidate_organization,
      candidate_alt_phone,
      candidate_expected_ctc,
      candidate_designation,
      candidate_notice_period,
      candidate_remarks,
      recruiter_id,
      position_id
    } = req.body;
    const candidate_resume = req.file ? req.file.path : null;
    let candidateExist;
    if (position_id) {
      candidateExist = await Candidate.findOne({
        where: {
          candidate_phone: candidate_phone,
          candidate_email: candidate_email,
          position: position_id
        }
      });
    }
    let updateData = {};

    if (candidateExist) {
      return res.status(404).json({ error: "Candidate already exist for this Position !", candidate_email, candidate_phone, position_id })
    } else {

      if (candidate_phone !== undefined) {
        updateData.candidate_phone = candidate_phone;

      }
      if (candidate_email !== undefined) {
        updateData.candidate_email = candidate_email;

      }
      if (candidate_location !== undefined) {
        updateData.candidate_location = candidate_location;

      }
      if (candidate_experience !== undefined) {
        updateData.candidate_experience = candidate_experience;

      }
      if (candidate_current_ctc !== undefined) {
        updateData.candidate_current_ctc = candidate_current_ctc;

      }
      if (candidate_qualification !== undefined) {
        updateData.candidate_qualification = candidate_qualification;

      }
      if (candidate_gender !== undefined) {
        updateData.candidate_gender = candidate_gender;

      }
      if (candidate_organization !== undefined) {
        updateData.candidate_organization = candidate_organization;

      }
      if (candidate_alt_phone !== undefined) {
        updateData.candidate_alt_phone = candidate_alt_phone;

      }
      if (candidate_expected_ctc !== undefined) {
        updateData.candidate_expected_ctc = candidate_expected_ctc;

      }
      if (candidate_designation !== undefined) {
        updateData.candidate_designation = candidate_designation;

      }
      if (candidate_notice_period !== undefined) {
        updateData.candidate_notice_period = candidate_notice_period;

      }
      if (candidate_remarks !== undefined) {
        updateData.candidate_remarks = candidate_remarks;

      }
      if (candidate_resume !== null) {
        updateData.candidate_resume = candidate_resume;

      }
      if (recruiter_id !== null) {
        updateData.updated_by = recruiter_id;
        updateData.updated_at = new Date();
      }

      await Candidate.update(
        updateData,
        { where: { id: id } }
      );

      return res
        .status(200)
        .json({
          success: "candidate data updated sucessfully",
          candidate: {
            id,
            candidate_phone,
            candidate_email,
            candidate_location,
            candidate_experience,
            candidate_current_ctc,
            candidate_qualification,
            candidate_organization,
            candidate_gender,
            candidate_alt_phone,
            candidate_expected_ctc,
            candidate_designation,
            candidate_notice_period,
            candidate_remarks,
            candidate_resume,
          },
        });

    }
  } catch (error) {
    console.error("Error updating candidate:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.editAtsStatus = async (req, res) => {
  try {
    const id = req.params.id;
    let { candidate_status, status_date, recruiter_id, interview_data } =
      req.body;

    let candidate;
    let status;
    let incrementUpdate;
    let newdate = new Date(status_date);
    let d = newdate.toISOString().split("T")[0];
    let date = d;
    let Mailerror = false;

    console.log(candidate_status, newdate, d, status_date, recruiter_id);

    let interviewschedule = "Interview Scheduled";
    let shortlistedfornextround = "Shortlisted For Next Round";
    let onhold = "Hold Post Interview";
    if (candidate_status === "Interview Done" || candidate_status === "Rejected Post Interview" || candidate_status === "Interview Feedback Pending" || candidate_status === "Final Selection" || candidate_status === "Final Joining") {
      let interviewExist = await Interview.findOne({
        where: {
          candidate_id: id,
          interview_status: {
            [Op.in]: [interviewschedule, shortlistedfornextround, onhold]
          }
        }
      });
      if (interviewExist) {
        return res
          .status(404)
          .json({
            error: `Can't change the status, candidate's Interview process is Ongoing!`,
            candidate_status,
            id,
          });
      }

    }

    let statusExist = await Status.findOne({
      where: { candidate_id: id, candidate_status: candidate_status },
    });

    console.log("=====>>> statusExist", statusExist, id, candidate_status);

    if (statusExist) {
      return res
        .status(404)
        .json({
          error: `${candidate_status} status already exist for this candidate, can't go backward !!`,
          candidate_status,
          id,
        });
    } else {
      //changing the status in all candidates table

      if (candidate_status === "Interview Scheduled") {
        let shortlistedStatus = 'Shortlisted';
        let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: shortlistedStatus } });
        if (!cand) {
          return res.status(404).json({
            error: "Can't schedule interview. This candidate is not shortlisted yet!!",
            id
          });
        }
        try {
          let report = await scheduleInterview({ id, candidate_status, status_date, recruiter_id, interview_data });
          console.log('Interview created successfully', report);

          if (report.errorinmail === true) {
            Mailerror = true;
          };

          return res.status(200).json({
            message: 'Interview created successfully',
            report,
          });
        } catch (error) {
          console.error('Error creating interview:', error);
          return res.status(500).json({ error: 'Error creating interview', details: error.message });
        }
      } else if (candidate_status === "Backout") {

        candidate = await Candidate.update(
          { candidate_status, status_date },
          { where: { id: id } }
        );

        await Interview.update({ interview_status: candidate_status }, { where: { candidate_id: id } });

        //creating a new status to add in status history

        status = await Status.create({
          candidate_id: id,
          candidate_status: candidate_status,
          status_date: status_date,
          created_by: recruiter_id
        });

      } else {
         // Prevent changing status if the candidate is not shortlisted or already selected
         if (!["CV Rejected", "Duplicate CV", "Shortlisted"].includes(candidate_status)) {
          let shortlistedStatus = 'Shortlisted';
          let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: shortlistedStatus } });
          if (!cand) {
            return res.status(404).json({
              error: `Can't change status to ${candidate_status}. This candidate is not shortlisted yet!!`,
              id
            });
          }
        }
        if (["CV Rejected", "Duplicate CV"].includes(candidate_status)) {
          let shortlistedStatus = 'Shortlisted';
          let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: shortlistedStatus } });
          if (cand) {
            return res.status(404).json({
              error: `Can't change status to ${candidate_status}. This candidate is Shortlisted.`,
              id
            });
          }
        }

        if (candidate_status === "Rejected Post Interview") {
          let finalSelectionStatus = 'Final Selection';
          let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: finalSelectionStatus } });
          if (cand) {
            return res.status(404).json({
              error: `Can't change status to ${candidate_status}. This candidate is Selected.`,
              id
            });
          }
        }

        if (candidate_status === "Hold Post Interview" || candidate_status === "Interview Done") {
          let finalSelectionStatus = 'Final Selection';
          let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: finalSelectionStatus } });
          if (cand) {
            return res.status(404).json({
              error: `Can't change status to ${candidate_status}. This candidate is Selected.`,
              id
            });
          }
        }
        if (candidate_status === "Final Joining") {
          let finalSelectionStatus = 'Final Selection';
          let cand = await Status.findOne({ where: { candidate_id: id, candidate_status: finalSelectionStatus } });
          if (!cand) {
            return res.status(404).json({
              error: `Can't change status to ${candidate_status}. This candidate is not selected yet !!`,
              id
            });
          }
        }

        candidate = await Candidate.update(
          { candidate_status, status_date },
          { where: { id: id } }
        );

        //creating a new status to add in status history

        status = await Status.create({
          candidate_id: id,
          candidate_status: candidate_status,
          status_date: status_date,
          created_by: recruiter_id
        });

      }


      // // //changing the status in all candidates table
      // const candidate = await Candidate.update({ candidate_status, status_date }, { where: { id: id } });

      // //creating a new status to add in status history

      // const status = await Status.create({ candidate_id: id, candidate_status: candidate_status, status_date: status_date });

      //changes
      let response;
      let result;

      // console.log("=======>>>> ", recruiter_id, report_date, candidate_status);

      // let recruiter = await sourcingReportByRecruiter.findOne({ where: { recruiter_id: recruiter_id, report_date: newdate } });

      // console.log("============>>", recruiter);

      // const statusMapping = {
      //     'CV Rejected': 'cv_rejected',
      //     'Shortlisted': 'shortlisted',
      //     'Interview Scheduled': 'interview_schedule',
      //     'Interview Done': 'interview_done',
      //     'Rejected Post Interview': 'reject_post_interview',
      //     'Final Selection': 'final_selection',
      //     'Offer Letter Sent': 'offer_letter_sent',
      //     'Final Joining': 'final_joining',
      //     'Backout': 'feedback_pending',
      //     'Feedback Pending': 'backout'
      // };

      // let fieldToIncrement = statusMapping[candidate_status];

      // if (recruiter) {
      //     let incrementUpdate = {};
      //     incrementUpdate[fieldToIncrement] = 1;
      //     await sourcingReportByRecruiter.increment(incrementUpdate, { where: { recruiter_id: recruiter_id, report_date: date } });
      // } else {
      //     let createData = { recruiter_id: recruiter_id, report_date: date };
      //     createData[fieldToIncrement] = 1;
      //     await sourcingReportByRecruiter.create(createData);
      // }



      const candidateinfo = await Candidate.findByPk(id);
      console.log(candidateinfo.position);

      const position = candidateinfo.position;

      if (candidate_status === "CV Rejected") {
        incrementUpdate = await Position.increment(
          { cv_rejected: 1 },
          { where: { id: position } }
        );
      } else if (candidate_status === "Shortlisted") {
        incrementUpdate = await Position.increment(
          { cv_shortlisted: 1 },
          { where: { id: position } }
        );
      } else if (candidate_status === "Backout") {
        incrementUpdate = await Position.increment(
          { cv_backout: 1 },
          { where: { id: position } }
        );
      } else if (candidate_status === "Interview Done") {
        incrementUpdate = await Position.increment(
          { cv_interviewed: 1 },
          { where: { id: position } }
        );
      }

      if (incrementUpdate) {
        console.log("Increment updateed position table", incrementUpdate);
      }
    }

    return res
      .status(200)
      .json({
        success: `Candidate status updated sucessfully !! ${Mailerror ? "Error in sending Mail !!" : ""}`,
        candidate: { id, candidate_status, status_date },
        status,
      });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getStatusHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const history = await Status.findAll({
      attributes: ["id", "candidate_status", "status_date"],
      where: { candidate_id: id },
    });
    res
      .status(200)
      .json({ message: "Status history fetched successfully", history });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

async function scheduleInterview({ id, candidate_status, status_date, recruiter_id, interview_data }) {
  try {
    const {
      candidate_id,
      interview_round,
      interview_date,
      interview_mode,
      interview_time,
      interview_location,
      interview_status,
      interview_remarks,
      interview_done,
      scheduled_date,
    } = interview_data;

    let thedate = new Date();
    let created_at = thedate.toISOString().split('T')[0];
    let errorinmail = false;

    const report = await interviewSchedule.create({
      candidate_id,
      interview_round,
      interview_mode,
      interview_date,
      interview_time,
      interview_location,
      interview_status,
      interview_remarks,
      interview_done,
      scheduled_date,
      created_by: recruiter_id,
      created_at: created_at,
    });

    // Check if the interview data is successfully added
    if (report) {
      await InterviewHistory.create(
        {
          candidate_id,
          interview_round,
          interview_mode,
          interview_date,
          interview_time,
          interview_location,
          interview_status,
          interview_remarks,
          scheduled_date,
          created_by: recruiter_id,
          created_at: created_at,
        }
      );
      const candidate = await Candidate.update(
        { candidate_status, status_date },
        { where: { id: id } }
      );

      // Creating a new status to add in status history
      const status = await Status.create({
        candidate_id: id,
        candidate_status: candidate_status,
        status_date: status_date,
        created_by: recruiter_id
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

            ]

          },
          {
            model: Users,
            required: true,
            attributes: ["name", "phone"],
          }
        ],
        where: { id: id }
      });
      let candidate_email = candidatedetails.candidate_email;
      let candidate_name = candidatedetails.candidate;
      let position = candidatedetails.Position.position;
      let company = candidatedetails.Position.Company.company_name;
      let companyaddress = candidatedetails.Position.Company.address;
      let contactperson = candidatedetails.User.name;
      let contactpersonphone = candidatedetails.User.phone;
      let interviewdate = interview_date.split("-").reverse().join("-");

      try {
        await sendMail({
          to: candidate_email,
          subject: `Interview Scheduled for ${position} position at ${company} !!`,
          text: `Dear, ${candidate_name}! 

Greetings from TalentCo HR Services LLP!

Your interview is scheduled with  ${company} on ${interviewdate} at  ${interview_time} for the post of ${position}.
Interview Round : ${interview_round}.
${interview_mode === "In Person" ? `Company Address: ${companyaddress}` : `${interview_location.includes('https') ? `Link` : `Interview Location`}: ${interview_location}`}.
Contact Person: ${contactperson}, ${contactpersonphone} 
              
Try to ${interview_location.includes('https') ? `Join 5 minutes` : `reach 15 minutes`} before the scheduled time to avoid any last-minute rush. 
                                                                                                                                                                                                                                                       
Kindly send your acknowledgment as a confirmation to this mail. 
              
All the very best.

Regards,
TalentCo HR Services`
        });
      } catch (mailError) {
        errorinmail = true;
        console.error('Error sending notification email:', mailError);
        //return res.status(500).json({ error: 'Failed to send notification email' });
      }

      let data = {
        candidate: candidate,
        status: status,
        report: report,
        errorinmail: errorinmail
      };

      return data;
    } else {
      throw new Error('Failed to create interview schedule');
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

