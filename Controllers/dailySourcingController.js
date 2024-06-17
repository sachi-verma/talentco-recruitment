const db = require('../Models/db');
const { Sequelize, where} = require('sequelize');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const AdminUpdate = require('../Models/dailyAdminUpdate');
const User = require('../Models/userDetails');
const { connect } = require('tedious');
const Roles = require("../Models/roles");
const Users = require("../Models/userDetails");
const assignRecruiter = require("../Models/assignRecruiter");
const Positions = require('../Models/allPositions');
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const statusHistory = require("../Models/statusHistory");
const path = require('path');


Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

User.hasMany(Position, { foreignKey: 'recruiter_assign' });
Position.belongsTo(User, { foreignKey: 'recruiter_assign' });

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

exports.getCompanies = async (req, res) => {
    try {
        const userId = req.query.id; 
        const user = await Users.findByPk(userId);
        
        if (!user) {
            console.error("User not found");
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        const role_id = user.role_id;
        const role = await Roles.findOne({ where: { id: role_id } });
        
        if (!role) {
            console.error("Role not found");
            res.status(404).json({ error: "Role not found" });
            return;
        }

        let companyDetails = [];
        let companies;

        if (role.role_name !== "Recruiter" && role.role_name !== "Team Lead") {
            companies = await Company.findAll();
        } else {
            const positions = await assignRecruiter.findAll({
                where: { recruiter_id: userId },
                attributes: ['position_id']
            });
            
            if (!positions || positions.length === 0) {
                console.log("No positions found");
                res.status(404).json({ error: "No positions found" });
                return;
            }
            
            console.log(positions.map(position => position.position_id));
            
            let companiesId = [];
            
            for (let position of positions) {
                let company = await Positions.findOne({ attributes: ["company_id"], where: { id: position.position_id } });
                if (company) {
                    companiesId.push(company.company_id);
                }
            }
            
            console.log(companiesId);

            // Remove duplicate company IDs
            companiesId = [...new Set(companiesId)];
            
            for (let companyId of companiesId) {
                let company = await Company.findOne({ where: { id: companyId } });
                if (company) {
                    companyDetails.push(company);
                }
            }

            let total_companies = companyDetails.length;
            
            const companiesToSend = companyDetails.map(companyDetail => ({
                id: companyDetail.id,
                name: companyDetail.company_name
            }));

            console.log(companiesToSend);

            res.json(companyDetails);
            return;
        }
        
        res.json(companies);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.getPositionsOfCompany = async (req,res) => {
   
    try {
        const companyId = req.params.companyId;
        const userId = req.query.id; 
        const user = await Users.findByPk(userId);
        
        if (!user) {
            console.error("User not found");
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        const role_id = user.role_id;
        const role = await Roles.findOne({ where: { id: role_id } });
        
        if (!role) {
            console.error("Role not found");
            res.status(404).json({ error: "Role not found" });
            return;
        }
        
        console.log(role.role_name);
        
        let positionDetails = [];
        let positionsForAll;

        if (role.role_name !== "Recruiter" && role.role_name !== "Team Lead") {
            positionsForAll = await Position.findAll({ where: { company_id: companyId } });
        } else {
            const positions = await assignRecruiter.findAll({
                where: { recruiter_id: userId },
                attributes: ['position_id']
            });
            
            if (!positions || positions.length === 0) {
                console.log("No positions found");
                res.status(404).json({ error: "No positions found" });
                return;
            }
            
            for (let position of positions) {
                let positionDetail = await Positions.findOne({ where: { id: position.position_id, company_id: companyId } });
                if (positionDetail) {
                    positionDetails.push(positionDetail);
                }
            }
        }

        res.json(role.role_name === "Recruiter" || role.role_name === "Team Lead" ? positionDetails : positionsForAll);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//USING THE daily_sourcing_report DATABASE
exports.createSourcingReport = async (req, res) => {
    try {
        const { id, candidate, company, position, location, ctc, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date } = req.body;

        const report = await Report.create({ id, candidate, company, position, location, ctc, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date });

        const alldata = await FilteredUpdate();

        res.status(200).json({ message: 'Report created successfully', report, alldata });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

//USING THE all_candidates DATABASE
exports.addSourcingReport = async (req, res) => {
    try {
        let { id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date,  candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks } = req.body;
        const userid = req.query.id;
        console.log(userid);
        console.log('Request body:', req.body); // Debugging: Log request body
        console.log('Uploaded file:', req.file); // Debugging: Log uploaded file


        const user =await User.findByPk(userid);
        if(!user){
            return res.status(404).json({error: 'User not found'});
        }
        console.log("=========>>>>>>>>",user);

       const created_by = user.id;
        let thedate = new Date();
        const date = thedate.toISOString().split('T')[0];
        let total_cv_sourced=1;

      

        candidate_resume = req.file ? req.file.path : null;
        console.log("===================>>>>>> resume",candidate_resume);
        // Define the required fields for validation
        let requiredFields = ['candidate', 'position', 'cv_sourced_from', 'relevant', 'sourcing_status'];

        // Check if candidate status is 'Screened', then add candidate_phone and candidate_email to required fields
        if (sourcing_status === 'Screened') {
            requiredFields = requiredFields.concat(['candidate_phone', 'candidate_alt_phone', 'candidate_email', 'candidate_location', 'candidate_qualification', 'candidate_experience', 'candidate_current_ctc', 'candidate_expected_ctc', 'candidate_organization', 'candidate_designation', 'candidate_notice_period', 'candidate_gender']);
        }

        // Validate the request body !req.body.hasOwnProperty(field) ||
        for (let field of requiredFields) {
            if (req.body[field] === null || req.body[field] === '') {
                console.error(`Missing or empty field: ${field} in report:`, req.body);
                return res.status(400).json({ error: `Missing or empty fields detected` });
            }
        }
        let report;
        if(sourcing_status === 'Screened'){
             report = await Candidate.create({ id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date, candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks, candidate_resume, created_by });
        }
        else{
             report = await Candidate.create({ id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date,created_by});

        }

        //updating sourcing report by recruiter

        let recruiter = await sourcingReportByRecruiter.findOne({where:{recruiter_id: userid, date: date}});
        let response ;
         if(recruiter ){
            response = await sourcingReportByRecruiter.increment(
              { total_cv_sourced: 1 },
              { where: { recruiter_id: userid,date: date}  }
          );
         }
         else{
            response = await sourcingReportByRecruiter.create({recruiter_id: userid, total_cv_sourced, date});
         }

        const alldata = await FilteredUpdate();
        const admindata = await DailyAdminUpdate();

        res.status(200).json({ message: 'Report created successfully', report, alldata, admindata , response:{msg:'created by added succesfully', userid,date} });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

// async function FilteredUpdate() {
//     try {
//         const allReports = await Candidate.findAll();

//         let alldata = [];
//         let filterArr = [];
//         let dates = [];

//         allReports.forEach((report) => {
//             dates.push(report.created_at);
//         });

//         const uniqueDates = [...new Set(dates)];

//         uniqueDates.forEach(async (update_date) => {
//             const filteredReports = allReports.filter((report) => report.created_at === update_date);

//             let total_cv_sourced = filteredReports.length;
//             let total_cv_relevant = filteredReports.filter((report) => report.relevant === "Yes").length;
//             let total_confirmation_pending = filteredReports.filter((report) => report.candidate_status === "confirmation pending").length;
//             let total_sent_to_client = filteredReports.filter((report) => report.candidate_status === "sent to client").length;

//             // Find or create the entry based on the update_date
//             const [update, created] = await Update.findOrCreate({
//                 where: { update_date },
//                 defaults: {
//                     total_cv_sourced,
//                     total_cv_relevant,
//                     total_confirmation_pending,
//                     total_sent_to_client
//                 }
//             });

//             // If the entry already existed, update its values
//             if (!created) {
//                 await update.update({
//                     total_cv_sourced,
//                     total_cv_relevant,
//                     total_confirmation_pending,
//                     total_sent_to_client
//                 });
//             }

//             alldata.push({
//                 update_date,
//                 total_cv_sourced,
//                 total_cv_relevant,
//                 total_confirmation_pending,
//                 total_sent_to_client
//             });
//         });

//         return alldata;
        
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// };

async function FilteredUpdate() {
    try {
        const allReports = await Candidate.findAll();

        let groupedReports = allReports.reduce((acc, report) => {
            const date = report.sourcing_date; // Ensure sourcing_date is being used correctly
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(report);
            return acc;
        }, {});

        let alldata = [];

        for (let date in groupedReports) {
            const reports = groupedReports[date];

            let total_cv_sourced = reports.length;
            let total_cv_relevant = reports.filter(report => report.relevant === "Yes").length;
            let total_confirmation_pending = reports.filter(report => report.sourcing_status === "Confirmation Pending").length;
            let total_sent_to_client = reports.filter(report => report.sourcing_status === "Sent To Client").length;

            // Find the entry based on the update_date
            let update = await Update.findOne({
                where: { update_date: date }
            });

            if (update) {
                // Update the existing entry
                await update.update({
                    total_cv_sourced,
                    total_cv_relevant,
                    total_confirmation_pending,
                    total_sent_to_client
                });
            } else {
                // Create a new entry
                update = await Update.create({
                    update_date: date,
                    total_cv_sourced,
                    total_cv_relevant,
                    total_confirmation_pending,
                    total_sent_to_client
                });
            }

            alldata.push({
                update_date: date,
                total_cv_sourced,
                total_cv_relevant,
                total_confirmation_pending,
                total_sent_to_client
            });
        }

        return alldata;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

async function DailyAdminUpdate() {
    try {
        const allReports = await Candidate.findAll();

        // Group reports by sourcing_date
        let groupedReports = allReports.reduce((acc, report) => {
            const date = report.sourcing_date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(report);
            return acc;
        }, {});

        let admindata = [];

        // Iterate through each date and update or create the AdminUpdate entry
        for (let date in groupedReports) {
            const reports = groupedReports[date];

            // Count how many reports have sourcing_status as "Sent To Client"
            let cv_sent_count = reports.filter(report => report.sourcing_status === "Sent To Client").length;

            // Find the entry based on the update_date
            let update = await AdminUpdate.findOne({
                where: { update_date: date }
            });

            if (update) {
                // Update the existing entry
                await update.update({
                    cv_sent_count
                });
            } else {
                // Create a new entry
                await AdminUpdate.create({
                    update_date: date,
                    cv_sent_count
                });
            }

            admindata.push({
                update_date: date,
                cv_sent_count
            });
        }

        return admindata;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// exports.createBulkSourcingReport = async (req, res) => {
//     try {
//         const reportsData = req.body; // Assuming the frontend sends an array of report objects
//         console.log("=====>>>>>")
//         if (!Array.isArray(reportsData) || reportsData.length === 0) {
//             console.error('No reports data provided');
//             return res.status(400).json({ error: 'No reports data provided' });
//         }

//         // Define the required fields for validation
//         let requiredFields = ['candidate', 'company', 'position', 'location', 'min_ctc', 'max_ctc', 'cv_sourced_from', 'relevant', 'sourcing_status'];

//         // Check if candidate status is 'Screened', then add candidate_phone and candidate_email to required fields
//         if (candidate_status === 'Screened') {
//             requiredFields = requiredFields.concat(['candidate_phone', 'candidate_alt_phone', 'candidate_email', 'candidate_location', 'candidate_qualification', 'candidate_experience', 'candidate_current_ctc', 'candidate_expected_ctc', 'candidate_organization', 'candidate_designation', 'candidate_notice_period', 'candidate_gender', 'candidate_remarks']);
//         }

//         // Validate each report object
//         for (let report of reportsData) {
//             for (let field of requiredFields) {
//                 if (!report.hasOwnProperty(field) || report[field] === null || report[field] === '') {
//                     console.error(`Missing or empty field: ${field} in report:`, report);
//                     return res.status(400).json({ error: `Missing or empty fields detected` });
//                 }
//             }
//         }
        
//         const createdReports = await Candidate.bulkCreate(reportsData);

//         const alldata = await FilteredUpdate();

//         const admindata = await DailyAdminUpdate();

//         if (!createdReports || createdReports.length === 0) {
//             console.error('No reports created');
//             return res.status(400).json({ error: 'No reports created' });
//         }

//         res.status(200).json({ message: 'Reports created successfully', reports: createdReports, alldata: alldata, admindata: admindata });
//     } catch (error) {
//         console.error('Error creating Reports:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.createBulkSourcingReport = async (req, res) => {
    try {
        const userid = req.query.id;
        console.log(userid);
        const reportsData = req.body; // Assuming the frontend sends an array of report objects
       //const created_by = user.id;
        let thedate = new Date();
        const date = thedate.toISOString().split('T')[0];
        let total_cv_sourced= reportsData.length;
      
      console.log("=====>>>>>");
      if (!Array.isArray(reportsData) || reportsData.length === 0) {
        console.error("No reports data provided");
        return res.status(400).json({ error: "No reports data provided" });
      }
  
      let screenedCandidatePresent = false;
  
      // Check if any candidate has sourcing_status as 'Screened'
      for (let report of reportsData) {
        if (report.sourcing_status === "Screened") {
          screenedCandidatePresent = true;
          break;
        }
      }
  
      // Define the required fields based on the presence of screened candidates
      let requiredFields = [
        "candidate",
        "company",
        "position",
        "location",
        "min_ctc",
        "max_ctc",
        "cv_sourced_from",
        "relevant",
        "sourcing_status",
        "created_by"
      ];
  
      // If there are screened candidates, add additional fields to requiredFields
      if (screenedCandidatePresent) {
        requiredFields = requiredFields.concat([
          "candidate_phone",
          "candidate_alt_phone",
          "candidate_email",
          "candidate_location",
          "candidate_qualification",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_expected_ctc",
          "candidate_organization",
          "candidate_designation",
          "candidate_notice_period",
          "candidate_gender",
           
        ]);
      }
  
      // Validate each report object
      for (let report of reportsData) {
        // Check if the report has sourcing status "Screened" to determine required fields
        let fieldsToCheck = requiredFields;
        if (report.sourcing_status !== "Screened") {
          fieldsToCheck = requiredFields.filter(field => ![
            "candidate_phone",
            "candidate_alt_phone",
            "candidate_email",
            "candidate_location",
            "candidate_qualification",
            "candidate_experience",
            "candidate_current_ctc",
            "candidate_expected_ctc",
            "candidate_organization",
            "candidate_designation",
            "candidate_notice_period",
            "candidate_gender",
             
          ].includes(field));
        }
        
        for (let field of fieldsToCheck) {
          if (
            !report.hasOwnProperty(field) ||
            report[field] === null ||
            report[field] === ""
          ) {
            console.error(
              `Missing or empty field: ${field} in report:`,
              report
            );
            return res
              .status(400)
              .json({ error: `Missing or empty fields detected ${field}` });
          }
        }
      }
  
      let createdReports;
  
      if (screenedCandidatePresent) {
        if (reportsData.length > 1) {
          createdReports = await Candidate.bulkCreate(reportsData);
        } else {
          createdReports = await Candidate.create(reportsData);
        }
      } else {
        createdReports = await Candidate.bulkCreate(reportsData);
      }

       //updating sourcing report by recruiter

     let recruiter = await sourcingReportByRecruiter.findOne({ where: { recruiter_id: userid, date: date } });

    let response;
    if (recruiter) {
        response = await sourcingReportByRecruiter.increment(
            { total_cv_sourced: total_cv_sourced },
            { where: { recruiter_id: userid, date: date } }
        );
    } else {
        response = await sourcingReportByRecruiter.create({
            recruiter_id: userid,
            total_cv_sourced: total_cv_sourced,
            date: date
        });
    }

    
      const alldata = await FilteredUpdate();
      const admindata = await DailyAdminUpdate();
  
      if (!createdReports || createdReports.length === 0) {
        console.error("No reports created");
        return res.status(400).json({ error: "No reports created" });
      }
  
      res.status(200).json({
        message: "Reports created successfully",
        response:{msg:'total cv sourced added succesfully', userid, date, total_cv_sourced},
        reports: createdReports,
        alldata: alldata,
        admindata: admindata,
      });
    } catch (error) {
      console.error("Error creating Reports:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  

// FROM all_candidates table
exports.getSourcingReport = async (req, res) => {
    try {
        const report = await Candidate.findAll({
            attributes: ['id', 'candidate', 'position', 'cv_sourced_from', 'relevant', 'sourcing_status', 'remarks', 'created_at', 'updated_at'],
            include: [{
                model: Position,
                required: true,
                attributes: ['id', 'company_id', 'position', 'location', 'experience', 'min_ctc', 'max_ctc'],
                include: [{
                    model: Company,
                    required: true,
                    attributes: ['company_name']
                }]
            }]
        });
        res.status(200).json({ message: 'Candidates fetched successfully', Candidates: report });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

//from daily_sourcing_report table
exports.getCandidateSourcing = async (req, res) => {
    try {
        const report = await Report.findAll(); 
        res.status(200).json(report); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getFilteredUpdate = async (req, res) => {
    try{
        const update = await Update.findAll();
        res.status(200).json(update);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.statusChange = async (req, res) => {
    
    try {
        const id = req.params.id;
        const { sourcing_status,recruiter_id } = req.body;
        
        console.log('Found', recruiter_id);

        let thedate = new Date();
        const sent_to_client_date = thedate.toISOString().split('T')[0];
       console.log(sent_to_client_date);

       let candidate_status = sourcing_status;
    
       if (sourcing_status ==='Sent To Client') {
       
        console.log(`Setting sent_to_client_date to: ${sent_to_client_date}`);
        await Candidate.update({ sourcing_status, candidate_status, sent_to_client_date }, { where: { id } });
      

      let response = await statusHistory.create({candidate_id:id, candidate_status:sourcing_status,created_by:recruiter_id,});
      if(!response){

        return res.status(404).json({error:"error creating candidate status in status history", candidate_status,id});

      }
    } else{
        await Candidate.update({ sourcing_status }, { where: { id } });
        let response = await statusHistory.create({candidate_id:id, candidate_status:sourcing_status,created_by:recruiter_id,});
       if(!response){

        return res.status(404).json({error:"error creating candidate status in status history", candidate_status,id});

      }
    } 
        //changes
     let sent_to_client = 1; 
        const status = await sourcingReportByRecruiter.findOne({ where:{recruiter_id: recruiter_id, date: sent_to_client_date}});
        let history;
        if (status){
            history = await sourcingReportByRecruiter.increment(
                { sent_to_client: 1 },
                { where: { recruiter_id: recruiter_id, date:sent_to_client_date}  })
             
        }
        else{
            history = await sourcingReportByRecruiter.create({recruiter_id: recruiter_id, sent_to_client:sent_to_client, date:sent_to_client_date});

        }

        // if(history){
        //     console.log("==========================> Response =================>",response);
        // }


       const candidate= await Candidate.findByPk(id);
       console.log(candidate.position);

       const position= candidate.position;

       let incrementUpdate ;

       if(sourcing_status === 'Rejected'){

        incrementUpdate = await Position.increment(
            { cv_rejected: 1 },
            { where: { id: position } }
        );

       } else if(sourcing_status === 'Confirmation Pending'){
        incrementUpdate = await Position.increment(
            { cv_confirmation_pending: 1 },
            { where: { id: position}  }
        );
       }
       else if(sourcing_status === 'Screened'){

        incrementUpdate = await Position.increment(
            { cv_screened: 1 },
            { where: { id: position } }
        );

       } else if(sourcing_status ==='Sent To Client'){

        incrementUpdate = await Position.increment(
            { cv_sent: 1 },
            { where: { id: position } }
        );
       }

       if(incrementUpdate){
        console.log('Increment updateed position table' , incrementUpdate);
       }
      

        const alldata = await FilteredUpdate();
  
        return res.status(200).json({ success: "status changed sucessfully", candidate: {id, sourcing_status}, alldata, recruiter_id, candidate_status }); 

    } catch (error) {
      console.error('Error changing status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  exports.editCandidateDetails = async (req,res) => {
    try {
        const id = req.params.id;
        const { candidate_phone, candidate_alt_phone, candidate_email, candidate_location, candidate_qualification, candidate_experience, candidate_current_ctc, candidate_expected_ctc, candidate_organization, candidate_designation, candidate_notice_period, candidate_gender, candidate_remarks } = req.body;
        
        await Candidate.update({ candidate_phone, candidate_alt_phone, candidate_email, candidate_location, candidate_qualification, candidate_experience, candidate_current_ctc, candidate_expected_ctc, candidate_organization, candidate_designation, candidate_notice_period, candidate_gender, candidate_remarks }, {where: {id: id}});
  
        return res.status(200).json({ success: "candidate data updated sucessfully", candidate: {id, candidate_phone, candidate_alt_phone, candidate_email, candidate_location, candidate_qualification, candidate_experience, candidate_current_ctc, candidate_expected_ctc, candidate_organization, candidate_designation, candidate_notice_period, candidate_gender, candidate_remarks } }); 

    } catch (error) {
        console.error('Error updating candidate:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
}


exports.getAdminReport = async (req, res) => {
    try {
        const report = await Candidate.findAll({
            attributes: [
                'position',
                [Sequelize.fn('DATE', Sequelize.col('sourcing_date')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('sourcing_status')), 'sentToClientCount']
            ],
            where: {
                sourcing_status: 'Sent To Client'
            },
            include: [{
                model: Position,
                required: true,
                attributes: ['id', 'company_id', 'position', 'location', 'recruiter_assign'],
                include: [{
                    model: Company,
                    required: true,
                    attributes: ['company_name'],
                }, 
                {
                    model: User,
                    required: true,
                    attributes: ['name']
                }]
            }],
            group: ['position.id', Sequelize.fn('DATE', Sequelize.col('sourcing_date'))],
            // raw: true
        });
        res.status(200).json({ message: 'Report fetched successfully', Candidates: report });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getFilteredAdmin = async (req, res) => {
    try{
        const update = await AdminUpdate.findAll();
        res.status(200).json(update);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}