const db = require('../Models/db');
const Jobs = require('../Models/jobDetails');
const Positions = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const {Op} = require("sequelize");
const Users = require("../Models/userDetails");
const assignRecruiter = require('../Models/assignRecruiter');
const excel = require('exceljs');

Company.hasMany(Positions, { foreignKey: "company_id" });
Positions.belongsTo(Company, { foreignKey: "company_id" });
Positions.hasMany(assignRecruiter, { foreignKey: "position_id" });   
assignRecruiter.belongsTo(Positions, { foreignKey: "position_id" }); 

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });


exports.exportJobs = async (req, res) => {
    try {
    //   const page = parseInt(req.query.page) || 1;
    //   const limit = parseInt(req.query.limit) || 10;
    //   const offset = (page - 1) * limit; 
  
      const filter = req.query.filter ? JSON.parse(req.query.filter):"";
  
      const {position, company, location, gender, qualification, recruiterId, notAssigned, fromDate, toDate}= filter;

      const companyFilters = {};
      if (company) {
        companyFilters.company_name = { [Op.like]: `%${company}%` };
      }
   
      const whereClause = {};
      if (position) whereClause.position = { [Op.like]: `%${position}%` };
      if (location) whereClause.location = { [Op.like]: `%${location}%` };
      if (gender) whereClause.gender_pref = { [Op.like]: `%${gender}%` };
      if (qualification) whereClause.qualification = { [Op.like]: `%${qualification}%` };
     // if (recruiterId) whereClause.recruiter_assign = { [Op.like]: `%${recruiterId}%` };
      if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };
      const assignRecruiterFilters = {};
      if (recruiterId)
        assignRecruiterFilters.recruiter_id = { [Op.like]: `%${recruiterId}%` };
  
      if (notAssigned === "Not assigned") assignRecruiterFilters.recruiter_id = null;
  
      if (fromDate && toDate) {
        let theDate = parseInt(toDate.split('-')[2]) + 1;
        let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, '0');
        whereClause.upload_date = {
          [Op.between]: [fromDate, newDate],
        };
      } else if (fromDate) { 
        whereClause.upload_date = {
          [Op.gte]:  fromDate,
        };
      } else if (toDate) {
        whereClause.upload_date = {
          [Op.lte]:  toDate,
        };
      }


     const job = await Positions.findAll({
     // attributes:{exclude:['recruiter_assign']},
        include: [
          {
            model: Company,
            required: true,
            where: companyFilters,
          },
          {
            model: assignRecruiter,
            required: false, // Set to false if a position can have no recruiters assigned
            attributes:["recruiter_id"],
            include: [
              {
                model: Users,
                attributes: ["name"], // Fetch recruiter names
              }
            ]
          }
        ],
        where:whereClause,
      });
        
    // Create Excel workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    // Add headers to the worksheet
    worksheet.addRow(['Upload Date','Position','Company', 'Location', 'Experience','Min CTC','Max CTC', 'Number of Positions','Position Status', 'Gender','Qualification', 'Recruiter Assign']);

    // Add data rows to the worksheet
    job.forEach(job => {
      // Concatenate recruiter names into a single string
      const recruiterAssignments = job.assignRecuiters || [];
      const recruiterNames = recruiterAssignments.map(recruiterAssignment => recruiterAssignment.User?.name).join(', ');
  
  
      worksheet.addRow([
          job.upload_date,
          job.position,
          job.Company.company_name,
          job.location,
          job.experience,
          job.min_ctc,
          job.max_ctc,
          job.no_of_positions,
          job.position_status,
          job.gender_pref,
          job.qualification,
          recruiterNames,
      ]);
  });

    // Generate a unique filename for the Excel file
     
    const filename = `exported_jobs.xlsx`;

    // Save the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the Excel file as a response
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
        
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("500 server error");
    }
  };
  