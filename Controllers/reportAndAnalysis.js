const db = require("../Models/db");
const { Op, Model } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const User = require("../Models/userDetails");
const {Sequelize} = require('sequelize');
const Users = require("../Models/userDetails");
const Roles = require("../Models/roles");

sourcingReportByRecruiter.belongsTo(User, { foreignKey: "recruiter_id" });
User.hasMany(sourcingReportByRecruiter, { foreignKey: "recruiter_id" });

Status.belongsTo(User, { foreignKey: "created_by" });
User.hasMany(Status, { foreignKey: "created_by" });


 
exports.reportAndAnalysis = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

    const userId = req.query.id;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const { recruiterName, fromDate, toDate } = filter;
    
    const whereClause = {};
    const recruiterFilter = {};

    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    if (user) {
    role_id = user.role_id;
    console.log("========>", role_id, user);

    if (role_id) {
      role = await Roles.findOne({ where: { id: role_id } });
      console.log("=========>>>>>>>>>>>>>>", role);

      if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
        whereClause.recruiter_id = userId;
      }
      
    }
  }

   // const userid = req.query.id;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

   
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

        //const candidates = await Status.count({where:{candidate_status:"Sent To Client"}});

//sent to client start
// let recruiter;
//         const candidates = await Status.findAll({
//           attributes: [
//             'created_by',
//             'status_date',
//             [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//           ],
//           where: { candidate_status: "Sent To Client" },
//           group: ['created_by', 'status_date'],
//         });
//         console.log("================================>> sent to client", candidates);

//         if(candidates.length!=0){

      
        
//         for (let sent of candidates) {
//           recruiter = await sourcingReportByRecruiter.findAll({
//             where: { recruiter_id: sent.created_by, report_date: sent.status_date }
//           });

//           console.log("========>>>> RRR", recruiter, sent.status_date, sent.created_by, candidates);
        
//           if (recruiter) {
//             await sourcingReportByRecruiter.increment(
//               { sent_to_client: sent.get('count') },
//               { where: { recruiter_id: sent.created_by, report_date: sent.status_date } }
//             );
//           } else {
//             await sourcingReportByRecruiter.create({
//               recruiter_id: sent.created_by,
//               report_date: sent.status_date,
//               sent_to_client: sent.get('count')
//             });
//           }
//         }
//       }
//         //sent to client end

//         //cv rejected start

//         const rejected_candidates = await Status.findAll({
//           attributes: [
//             'created_by',
//             'status_date',
//             [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//           ],
//           where: { candidate_status: "CV Rejected" },
//           group: ['created_by', 'status_date'],
//         });
//         console.log("================================>>rejected", rejected_candidates);

//         if(rejected_candidates.length!=0){

//         for (let sent of rejected_candidates) {
//           let recruiter = await sourcingReportByRecruiter.findOne({
//             where: { recruiter_id: sent.created_by, date: sent.status_date }
//           });
        
//           if (recruiter) {
//             await sourcingReportByRecruiter.increment(
//               { cv_rejected: sent.get('count') },
//               { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//             );
//           } else {
//             await sourcingReportByRecruiter.create({
//               recruiter_id: sent.created_by,
//               date: sent.status_date,
//               cv_rejected: sent.get('count')
//             });
//           }
//         }
//       }
//  //cv rejected end

//   //shortlisted start

// const shortlisted_candidates = await Status.findAll({
//           attributes: [
//             'created_by',
//             'status_date',
//             [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//           ],
//           where: { candidate_status: "Shortlisted" },
//           group: ['created_by', 'status_date'],
//         });
//         console.log("================================>>shortlisted", shortlisted_candidates);

//         if(shortlisted_candidates.length!=0){

//         for (let sent of shortlisted_candidates) {
//           let recruiter = await sourcingReportByRecruiter.findOne({
//             where: { recruiter_id: sent.created_by, date: sent.status_date }
//           });
        
//           if (recruiter) {
//             await sourcingReportByRecruiter.increment(
//               { shortlisted: sent.get('count') },
//               { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//             );
//           } else {
//             await sourcingReportByRecruiter.create({
//               recruiter_id: sent.created_by,
//               date: sent.status_date,
//               shortlisted: sent.get('count')
//             });
//           }
//         }
//       }
// // sortlisted end

// //interview sechduled start
// const interview_sechduled = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Interview Scheduled" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>interview sechdule", interview_sechduled);

// if(interview_sechduled.length!=0){

// for (let sent of interview_sechduled) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { interview_sechdule: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       interview_sechdule: sent.get('count')
//     });
//   }
// }
// }
// //interview sechduled end

// //interview done start
// const interview_done = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Interview Done" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>> interview done", interview_done);

// if(interview_done.length!=0){

// for (let sent of interview_done) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { interview_done: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       interview_done: sent.get('count')
//     });
//   }
// }
// }
// //interview done end


// //reject post interview start
// const reject_post_interview = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Rejected Post Interview" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>rejected interview", reject_post_interview);

// if(reject_post_interview.length!=0){

// for (let sent of reject_post_interview) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { reject_post_interview: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       reject_post_interview: sent.get('count')
//     });
//   }
// }
// }
// //reject post interview end

// //final selection start
// const final_selection = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Final Selection" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>final selection", final_selection);

// if(final_selection.length!=0){

// for (let sent of final_selection) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { final_selection: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       final_selection: sent.get('count')
//     });
//   }
// }
// }

// //final selection end

// //offer letter send starts
// const offer_letter_send = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Offer Letter Sent" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>offer letter send", offer_letter_send);

// if(offer_letter_send.length!=0){

// for (let sent of offer_letter_send) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { offer_letter_sent: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       offer_letter_sent: sent.get('count')
//     });
//   }
// }
// }

// //offer letter send ends

// //final joining starts
// const final_joining = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Final Joining" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>final joining", final_joining);

// if(final_joining.length!=0){

// for (let sent of final_joining) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { final_joining: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       final_joining: sent.get('count')
//     });
//   }
// }
// }


// //final joining ends

// // feedback pending starts
// const feedback_pending = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Feedback Pending" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>feedback pending", feedback_pending);

// if(feedback_pending.length!=0){

// for (let sent of feedback_pending) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { feedback_pending: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       feedback_pending: sent.get('count')
//     });
//   }
// }
// }
// //feedback pending ends

// //backout starts
// const backout = await Status.findAll({
//   attributes: [
//     'created_by',
//     'status_date',
//     [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
//   ],
//   where: { candidate_status: "Backout" },
//   group: ['created_by', 'status_date'],
// });
// console.log("================================>>backout", backout);

// if(backout.length!=0){

// for (let sent of backout) {
//   let recruiter = await sourcingReportByRecruiter.findOne({
//     where: { recruiter_id: sent.created_by, date: sent.status_date }
//   });

//   if (recruiter) {
//     await sourcingReportByRecruiter.increment(
//       { backout: sent.get('count') },
//       { where: { recruiter_id: sent.created_by, date: sent.status_date } }
//     );
//   } else {
//     await sourcingReportByRecruiter.create({
//       recruiter_id: sent.created_by,
//       date: sent.status_date,
//       backout: sent.get('count')
//     });
//   }
// }
// }

//backout ends


const statusMappings = [
  { status: "Sent To Client", column: "sent_to_client" },
  { status: "CV Rejected", column: "cv_rejected" },
  { status: "Shortlisted", column: "shortlisted" },
  { status: "Interview Scheduled", column: "interview_scheduled" },
  { status: "Interview Done", column: "interview_done" },
  { status: "Rejected Post Interview", column: "reject_post_interview" },
  { status: "Final Selection", column: "final_selection" },
  { status: "Offer Letter Sent", column: "offer_letter_sent" },
  { status: "Final Joining", column: "final_joining" },
  { status: "Feedback Pending", column: "feedback_pending" },
  { status: "Backout", column: "backout" }
];

for (let mapping of statusMappings) {
  const candidates = await Status.findAll({
    attributes: [
      'created_by',
      'status_date',
      [Sequelize.fn('COUNT', Sequelize.col('candidate_status')), 'count']
    ],
    where: { candidate_status: mapping.status },
    group: ['created_by', 'status_date'],
  });

  for (let sent of candidates) {
    const existingEntry = await sourcingReportByRecruiter.findOne({
      where: { recruiter_id: sent.created_by, report_date: sent.status_date },
      transaction
    });

    console.log("....................>>>>>>>",sent.created_by, sent.status_date);

    if (existingEntry) {
      // Update existing entry
      existingEntry[mapping.column] = sent.get('count');
      await existingEntry.save({ transaction });
    } else {
      // Create new entry
      await sourcingReportByRecruiter.create({
        recruiter_id: sent.created_by,
        report_date: sent.status_date,
        [mapping.column]: sent.get('count')
      }, { transaction });
      console.log("....................>>>>>>>",sent.created_by, sent.status_date);
    }
  }
}

await transaction.commit();

  //fetching the report to send back 

  const [result, totalRecords]= await Promise.all([

    await sourcingReportByRecruiter.findAll({
      include: [{
        model: User,
        required: true,
        attributes:["name"],
        where:recruiterFilter
      }],

      where: whereClause,
      limit,
      offset
    }),

    await sourcingReportByRecruiter.count({
      include: [{
        model: User, 
        required: true,
        attributes:["name"],
        where:recruiterFilter 
      }],

      where: whereClause,
    }),
  ]);

    // const result = await sourcingReportByRecruiter.findAll({
    //   include: [{
    //     model: User,
    //     required: true,
    //     attributes:["name"],
    //     where:recruiterFilter
    //   }],

    //   where: whereClause,
    //   limit,
    //   offset
    // });

    let records = result.length;
      const pages = Math.ceil(filter ? records / limit : totalRecords / limit);

    // const data = result[0].dataValues;
    res.json({ totalRecords: filter ? records : totalRecords,
      pages: pages,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
