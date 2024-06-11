const db = require('../Models/db');
const { Sequelize} = require('sequelize');
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
            return;
        }
        
        const role_id = user.role_id;
        const role = await Roles.findOne({ where: { id: role_id } });
        
        if (!role) {
            console.error("Role not found");
            return;
        }
        let companyDetails = [];

        let companies;
        if (!role.role_name === "Recruiter") {
             companies = await Company.findAll();
        } else{
            const positions = await assignRecruiter.findAll({
                where: { recruiter_id: userId },
                attributes: ['position_id']
            });
            
            if (!positions || positions.length === 0) {
                console.log("No positions found");
                return;
            }
            
            console.log(positions.map(position => position.position_id));
            
            let companiesId = [];
            
            for (let position of positions) {
                let company = await Positions.findOne({ where: { id: position.position_id } });
                if (company) {
                    companiesId.push(company);
                }
            }
            
            console.log(companiesId.map(company => company.company_id));
            
           
            
            for (let com of companiesId) {
              let company =  await Company.findOne({where:{id: com.company_id}});
              companyDetails.push(company);
            };
            
            let total_companies = companyDetails.length;
            
            const companiesTosent = companyDetails.map(companyDetail => ({
              id: companyDetail.id,
              name: companyDetail.company_name
            }));
            console.log(companyDetails);    

        }
        
        console.log(role.role_name);
        
        const recruiterFilter = {};
        
      
       
        res.json(role.role_name === "Recruiter"?companyDetails:companies);
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
            return;
        }
        
        const role_id = user.role_id;
        const role = await Roles.findOne({ where: { id: role_id } });
        
        if (!role) {
            console.error("Role not found");
            return;
        }
        
        console.log(role.role_name);
        
        let positionDetails = [];
        let positionsForall;

        if (!role.role_name === "Recruiter") {
            positionsForall = await Position.findAll({ where: { company_id: companyId } });
        }
        else{
            const positions = await assignRecruiter.findAll({
                where: { recruiter_id: userId },
                attributes: ['position_id']
            });
            
            if (!positions || positions.length === 0) {
                console.log("No positions found");
                return;
            }
    
             
           
            
            for (let positionid of positions) {
                let position = await Positions.findOne({ where: { id: positionid.position_id, company_id: companyId } });
                if (position) {
                    positionDetails.push(position);
                }
            }

        }
        res.json(role.role_name === "Recruiter"?positionDetails:positionsForall);
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
        const { id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date,  candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks, candidate_resume } = req.body;

        // Define the required fields for validation
        let requiredFields = ['candidate', 'position', 'cv_sourced_from', 'relevant', 'sourcing_status'];

        // Check if candidate status is 'Screened', then add candidate_phone and candidate_email to required fields
        if (sourcing_status === 'Screened') {
            requiredFields = requiredFields.concat(['candidate_phone', 'candidate_alt_phone', 'candidate_email', 'candidate_location', 'candidate_qualification', 'candidate_experience', 'candidate_current_ctc', 'candidate_expected_ctc', 'candidate_organization', 'candidate_designation', 'candidate_notice_period', 'candidate_gender', 'candidate_remarks']);
        }

        // Validate the request body
        for (let field of requiredFields) {
            if (!req.body.hasOwnProperty(field) || req.body[field] === null || req.body[field] === '') {
                console.error(`Missing or empty field: ${field} in report:`, req.body);
                return res.status(400).json({ error: `Missing or empty fields detected` });
            }
        }
        let report;
        if(sourcing_status === 'Screened'){
             report = await Candidate.create({ id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date, candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks, candidate_resume });
        }
        else{
             report = await Candidate.create({ id, candidate, position, cv_sourced_from, relevant, sourcing_status, remarks, sourcing_date});

        }

        const alldata = await FilteredUpdate();
        const admindata = await DailyAdminUpdate();

        res.status(200).json({ message: 'Report created successfully', report, alldata, admindata });
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
      const reportsData = req.body; // Assuming the frontend sends an array of report objects
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
    
      const alldata = await FilteredUpdate();
      const admindata = await DailyAdminUpdate();
  
      if (!createdReports || createdReports.length === 0) {
        console.error("No reports created");
        return res.status(400).json({ error: "No reports created" });
      }
  
      res.status(200).json({
        message: "Reports created successfully",
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
        const { sourcing_status } = req.body;

        let thedate = new Date();
        const sent_to_client_date = thedate.toISOString().split('T')[0];
       // console.log(sent_to_client_date);
    
       if (sourcing_status ==='Sent To Client') {
        console.log(`Setting sent_to_client_date to: ${sent_to_client_date}`);
        await Candidate.update({ sourcing_status, sent_to_client_date }, { where: { id } });
      }  
        //changes

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
  
        return res.status(200).json({ success: "status changed sucessfully", candidate: {id, sourcing_status}, alldata }); 

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