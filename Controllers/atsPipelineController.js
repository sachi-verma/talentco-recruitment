const db = require("../Models/db");
const { Op, DATE } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const interviewSchedule = require("../Models/interviewSchedule");
const {sendMail }= require("../Controllers/emailController");
const Interview = require("../Models/interviewSchedule");

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
      candidate_alt_phone,
      candidate_expected_ctc,
      candidate_designation,
      candidate_notice_period,
      candidate_remarks,
    } = req.body;
    const candidate_resume = req.file ? req.file.path : null;
    await Candidate.update(
      {
        candidate_phone,
        candidate_email,
        candidate_location,
        candidate_experience,
        candidate_current_ctc,
        candidate_qualification,
        candidate_gender,
        candidate_alt_phone,
        candidate_expected_ctc,
        candidate_designation,
        candidate_notice_period,
        candidate_remarks,
        candidate_resume,
      },
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
          candidate_gender,
          candidate_alt_phone,
          candidate_expected_ctc,
          candidate_designation,
          candidate_notice_period,
          candidate_remarks,
          candidate_resume,
        },
      });
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

    console.log(candidate_status, newdate, d, status_date, recruiter_id);
    let interviewschedule = "Interview Scheduled";
    let shortlistedfornextround ="Shortlisted For Next Round";
    let onhold = "Hold Post Interview";
    if(candidate_status ==="Interview Done" || candidate_status ==="Rejected Post Interview" || candidate_status ==="Interview Feedback Pending" || candidate_status ==="Final Selection" || candidate_status ==="Final Joining"){
      let interviewExist = await Interview.findOne({
        where: {
          candidate_id: id,
          interview_status: {
            [Op.in]: [interviewschedule, shortlistedfornextround, onhold]  
          }
        }
      });
      if(interviewExist){
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
      where: { id: id, candidate_status: candidate_status },
    });
    
    if (statusExist) {
      return res
        .status(404)
        .json({
          error: `${candidate_status} status already exist for this candidate, can't go backward !`,
          candidate_status,
          id,
        });
    } else {
      //changing the status in all candidates table

      if(candidate_status==="Interview Scheduled"){
        try {
            let report = await scheduleInterview({ id, candidate_status, status_date, recruiter_id, interview_data });
            console.log('Interview created successfully', report);
  
            return res.status(200).json({
              message: 'Interview created successfully',
              report,
            });
          } catch (error) {
            console.error('Error creating interview:', error);
            return res.status(500).json({ error: 'Error creating interview', details: error.message });
          }
    } else if(candidate_status==="Backout"){

      candidate = await Candidate.update(
        { candidate_status, status_date },
        { where: { id: id } }
      );

      await Interview.update({interview_status:candidate_status},{where: { candidate_id: id}});

      //creating a new status to add in status history

      status = await Status.create({
        candidate_id: id,
        candidate_status: candidate_status,
        status_date: status_date,
      });

    }else{
        candidate = await Candidate.update(
            { candidate_status, status_date },
            { where: { id: id } }
          );
    
          //creating a new status to add in status history
    
          status = await Status.create({
            candidate_id: id,
            candidate_status: candidate_status,
            status_date: status_date,
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

      let recruiter = await sourcingReportByRecruiter.findOne({ where: { recruiter_id: recruiter_id, report_date: newdate } });

      console.log("============>>", recruiter);

      const statusMapping = {
          'CV Rejected': 'cv_rejected',
          'Shortlisted': 'shortlisted',
          'Interview Scheduled': 'interview_schedule',
          'Interview Done': 'interview_done',
          'Rejected Post Interview': 'reject_post_interview',
          'Final Selection': 'final_selection',
          'Offer Letter Sent': 'offer_letter_sent',
          'Final Joining': 'final_joining',
          'Backout': 'feedback_pending',
          'Feedback Pending': 'backout'
      };

      let fieldToIncrement = statusMapping[candidate_status];

      if (recruiter) {
          let incrementUpdate = {};
          incrementUpdate[fieldToIncrement] = 1;
          await sourcingReportByRecruiter.increment(incrementUpdate, { where: { recruiter_id: recruiter_id, report_date: date } });
      } else {
          let createData = { recruiter_id: recruiter_id, report_date: date };
          createData[fieldToIncrement] = 1;
          await sourcingReportByRecruiter.create(createData);
      }

    

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
        success: "candidate status updated sucessfully",
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
        const candidate = await Candidate.update(
          { candidate_status, status_date },
          { where: { id: id } }
        );
  
        // Creating a new status to add in status history
        const status = await Status.create({
          candidate_id: id,
          candidate_status: candidate_status,
          status_date: status_date,
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
                      attributes: ["company_name"],
                       
                    },
                ]
            
        }], 
            where:{id: id}
        });
         let candidate_email = candidatedetails.candidate_email;
         let candidate_name = candidatedetails.candidate;
         let position = candidatedetails.Position.position;
         let company = candidatedetails.Position.Company.company_name;

         try {
            await sendMail({
              to: candidate_email,
              subject: `Interview Scheduled for ${position} position at ${company} !!`,
              text: `Dear, ${candidate_name}! 

               Your interview have been scheduled for  ${position} position at ${company} on ${interview_date}. you can find interview Details below :-
                Interview Round : ${interview_round},
                Interview Mode :  ${interview_mode},
                Interview Time : ${interview_time},
                ${interview_mode==="In Person" ?`Interview Location: ${interview_location} `:""}
             
            Best of Luck !!

            Regards,
            Talent Co Hr Services`
            });
          } catch (mailError) {
            console.error('Error sending notification email:', mailError);
            //return res.status(500).json({ error: 'Failed to send notification email' });
          }
  
        let data = {
          candidate: candidate,
          status: status,
          report: report
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

