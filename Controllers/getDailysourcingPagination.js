const db = require("../Models/db");
const { Sequelize } = require("sequelize");
const Report = require("../Models/dailySourcingReport");
const Update = require("../Models/dailySourcingUpdate");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const AdminUpdate = require("../Models/dailyAdminUpdate");
const User = require("../Models/userDetails");
const { Op } = require("sequelize");
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");
const excel = require("exceljs");
const Users = require("../Models/userDetails");
const Roles = require("../Models/roles");
const assignRecruiter = require("../Models/assignRecruiter");

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

User.hasMany(Position, { foreignKey: 'recruiter_assign' });
Position.belongsTo(User, { foreignKey: 'recruiter_assign' });

 

exports.getSourcingReportByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const {
      position,
      candidate,
      cvSourcedFrom,
      sourcingStatus,
      fromDate,
      toDate,
    } = filter;

    // const candidateName = req.query.candidateName;
    // const cv_sourced_from = req.query.cvFrom;
    // const sourcing_status = req.query.sourcingStatus;
    // const position = req.query.position;

    const filters = {};
    if (candidate) {
      filters.candidate = { [Op.like]: `%${candidate}%` };
    }
    if (cvSourcedFrom) {
      filters.cv_sourced_from = { [Op.like]: `%${cvSourcedFrom}%` };
    }
    if (sourcingStatus) {
      filters.sourcing_status = { [Op.like]: `%${sourcingStatus}%` };
    }

    const companyFilters = {};
    if (position) {
      companyFilters.position = { [Op.like]: `%${position}%` };
    }

    const [report, totalRecords] = await Promise.all([
      await Candidate.findAll({
        attributes: [
          "id",
          "candidate",
          "position",
          "cv_sourced_from",
          "relevant",
          "sourcing_status",
          "remarks",
          "created_at",
          "updated_at",
        ],
        include: [
          {
            model: Position,
            required: true,
            where: companyFilters,
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
        where: filters,
        limit,
        offset,
      }),
      await Candidate.count({
        attributes: [
          "id",
          "candidate",
          "position",
          "cv_sourced_from",
          "relevant",
          "sourcing_status",
          "remarks",
          "created_at",
          "updated_at",
        ],
        include: [
          {
            model: Position,
            required: true,
            where: companyFilters,
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
        where: filters,
      }),
    ]);

    // const report = await Candidate.findAll({
    //   attributes: [
    //     "id",
    //     "candidate",
    //     "position",
    //     "cv_sourced_from",
    //     "relevant",
    //     "sourcing_status",
    //     "remarks",
    //     "created_at",
    //     "updated_at",
    //   ],
    //   include: [
    //     {
    //       model: Position,
    //       required: true,
    //       where: companyFilters,
    //       attributes: [
    //         "id",
    //         "company_id",
    //         "position",
    //         "location",
    //         "experience",
    //         "min_ctc",
    //         "max_ctc",
    //       ],
    //       include: [
    //         {
    //           model: Company,
    //           required: true,
    //           attributes: ["company_name"],
    //         },
    //       ],
    //     },
    //   ],
    //   where: filters,
    //   limit,
    //   offset,
    // });

    if (download) {
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("Dailysourcing");

      // Add headers to the worksheet
      worksheet.addRow([
        "Company",
        "Position",
        "Candidate", 
        "Sourcing Status",
        "CV Sourced From",
        "Relevent",
        "Remarks",
        "Location",
        "Min Experience",
        "Max Experience",
        "Min CTC",
        "Max CTC",
      ]);

      // Add data rows to the worksheet
      report.forEach((report) => {
        worksheet.addRow([
          report.Position.Company.company_name,
          report.Position.position,
          report.candidate,
          report.sourcing_status,
          report.cv_sourced_from,
          report.relevant,
          report.remarks,
          report.Position.location,
          report.Position.min_experience,
          report.Position.max_experience,
          report.Position.min_ctc,
          report.Position.max_ctc,
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_dailysourcing.xlsx`;

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
    } else {
      let records = report.length;
      const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
      res.status(200).json({
        message: "Candidates fetched successfully",
        totalRecords: filter ? records : totalRecords,
        pages: pages,
        Candidates: report,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

async function FilteredUpdateByRecruiter ({recruiterId}) {
  try {
      //const recruiterId = req.params.id;

      // Fetch all candidate reports including their associated positions and recruiters
      const allReports = await Candidate.findAll({
          // include: [
          //     {
          //         model: Position,
          //         required: true,
          //         attributes: ["id", "position", "location"],
          //         include: [
          //             {
          //                 model: assignRecruiter,
          //                 required: true,
          //                 attributes: ["recruiter_id"],
          //                 where: { recruiter_id: recruiterId }
          //             }
          //         ]
          //     }
          // ]
          where:{created_by:recruiterId}
      });

      // Group the reports by sourcing_date
      let groupedReports = allReports.reduce((acc, report) => {
          const date = report.sourcing_date; // Ensure sourcing_date is being used correctly
          if (!acc[date]) {
              acc[date] = [];
          }
          acc[date].push(report);
          return acc;
      }, {});

      let aggregatedData = [];

      for (let date in groupedReports) {
          const reports = groupedReports[date];

          let totalCvSourced = reports.length;
          let totalCvRelevant = reports.filter(report => report.relevant === "Yes").length;
          let totalConfirmationPending = reports.filter(report => report.sourcing_status === "Confirmation Pending").length;
          let totalSentToClient = reports.filter(report => report.sourcing_status === "Sent To Client").length;

         let update = await sourcingReportByRecruiter.findOne({
          where:{ report_date:date, recruiter_id:recruiterId,}

         }) ;
         console.log("==============>>>>>>>", update);
         if(update){
          await update.update({
              total_cv_sourced:totalCvSourced,
              sent_to_client:totalSentToClient,
              cv_relevant:totalCvRelevant,
              cv_confirmation_pending:totalConfirmationPending
              
          })

         } 
         else{

          await sourcingReportByRecruiter.create({
              total_cv_sourced:totalCvSourced,
              sent_to_client:totalSentToClient,
              cv_relevant:totalCvRelevant,
              cv_confirmation_pending:totalConfirmationPending,
              recruiter_id:recruiterId,
              report_date:date
          })
          }


          aggregatedData.push({
              update_date: date,
              total_cv_sourced: totalCvSourced,
              total_cv_relevant: totalCvRelevant,
              total_confirmation_pending: totalConfirmationPending,
              total_sent_to_client: totalSentToClient
          });
      }

      return aggregatedData;

  } catch (error) {
      console.error('Error:', error);
  }
};

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

exports.getFilteredUpdateByPage = async (req, res) => {
  try {
    //date filter
    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

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

      if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
        recruiterFilter.recruiter_id = userId;
      }
      
    }
  }

    console.log(filter);

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const { fromDate, toDate } = filter;

    const whereClause = {};

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.update_date = {
        [Op.between]: [fromDate, newDate],
      };
      recruiterFilter.report_date ={
        [Op.between]: [fromDate, newDate],
      }
    } else if (fromDate) {
      whereClause.update_date = {
        [Op.gte]: fromDate,
      };
      recruiterFilter.report_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.update_date = {
        [Op.lte]: toDate,
      };
      recruiterFilter.report_date = {
        [Op.lte]: fromDate,
      };
    }

    const alldata = await FilteredUpdate();
    const allrecruiterdata = await FilteredUpdateByRecruiter({recruiterId: userId});

   let report;
   let totalRecords;
    if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
        [report, totalRecords] = await Promise.all([
        
        await sourcingReportByRecruiter.findAll({
          attributes: [
            ['total_cv_sourced', 'total_cv_sourced'],
            ['cv_relevant', 'total_cv_relevant'],
            ['cv_confirmation_pending', 'total_confirmation_pending'],
            ['sent_to_client', 'total_sent_to_client'],
            ['report_date', 'update_date']
          ],
          where:recruiterFilter , order: [["update_date", "DESC"]], limit, offset}),
        await sourcingReportByRecruiter.count({where:recruiterFilter}),
      ]);
    } else{

        [report, totalRecords] = await Promise.all([
        await Update.findAll({ where: whereClause, order: [["update_date", "DESC"]], limit, offset }),
        await Update.count({ limit, offset }),
        
         
      ]);

    }

   
   

    if (download){
        // Create Excel workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("filtered Update");
  
        // Add headers to the worksheet
  
      const headerRow =  worksheet.addRow([
          "Sr No.",
          "Date",
          "Total CV Sourced",
          "Total CV Relevent",
          "Total Confirmation Pending",
          "Total Sent to client",
          
        ]);

        headerRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }, 
          };
        });
        // Add data rows to the worksheet
        report.forEach((report, index) => {
          worksheet.addRow([
            index +1,
            report.update_date,
            report.total_cv_sourced,
            report.total_cv_relevant,
            report.total_confirmation_pending,
            report.total_sent_to_client
             
          ]);
        });
  
        // Generate a unique filename for the Excel file
  
        const filename = `Exported_filteredUpdate.xlsx`;
  
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
      let records = report.length;

      const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
      res.status(200).json({
        totalRecords: filter ? records : totalRecords,
        pages: pages,
        update: [...report],
        alldata,
        allrecruiterdata
      });
    }

   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.getAdminReportByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number
    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }
    // const startDate = req.query.startDate
    //   ? new Date(req.query.startDate)
    //   : null;
    // const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    // Build the where clause with the date filter
    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const { fromDate, toDate } = filter;

    const whereClause = {
      sourcing_status: "Sent To Client",
    };

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.sourcing_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      whereClause.sourcing_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.sourcing_date = {
        [Op.lte]: toDate,
      };
    }

    // Step 1: Get the total count of unique positions and sourcing_date combinations
    const totalCountResult = await Candidate.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("sourcing_date")), "date"],
      ],
      where: whereClause,
      // include: [
      //   {
      //     model: Position,
      //     required: true,
      //     attributes: ["id"],
      //   },
      // ],
      group: [
        // "Position.id",
        Sequelize.fn("DATE", Sequelize.col("sourcing_date")),
      ],
    });

    const totalRecords = totalCountResult.length;

    // Step 2: Get the paginated data
    const report = await Candidate.findAll({
      attributes: [
        // "position",
        [Sequelize.fn("DATE", Sequelize.col("sourcing_date")), "date"],
        [
          Sequelize.fn("COUNT", Sequelize.col("sourcing_status")),
          "sentToClientCount",
        ],
      ],
      where: whereClause,
      // include: [
      //   {
      //     model: Position,
      //     required: true,
      //     attributes: [
      //       "id",
      //       "company_id",
      //       "position",
      //       "location",
      //       "recruiter_assign",
      //     ],
      //     include: [
      //       {
      //         model: Company,
      //         required: true,
      //         attributes: ["company_name"],
      //       },
      //       {
      //         model: User,
      //        // required: true,
      //         attributes: ["name"],
      //       },
      //     ],
      //   },
      // ],
      group: [
        // "Candidates.position",
        Sequelize.fn("DATE", Sequelize.col("sourcing_date")),
        // "Position.id",
        // "Position.company_id",
        // "Position.position",
        // "Position.location",
        // "Position.recruiter_assign",
        // "Position.Company.company_name",
        // "Position.User.name",
      ],
      limit,
      order:[["date","DESC"]],
      offset,
    });

    if(download){
         // Create Excel workbook and worksheet
         const workbook = new excel.Workbook();
         const worksheet = workbook.addWorksheet("Admin report");
   
         // Add headers to the worksheet
         worksheet.addRow([
           "Date",
           "Total CV Sent ",
         ]);
   
         // Add data rows to the worksheet
         report.forEach((reportItem) => {
           worksheet.addRow([
             reportItem.dataValues.date,
             reportItem.dataValues.sentToClientCount,
           ]);
         });
   
         // Generate a unique filename for the Excel file
   
         const filename = `Exported_dailysourcing.xlsx`;
   
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
      let records = report.length;

      const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
  
      res.status(200).json({
        message: "Report fetched successfully",
        totalRecords: filter ? records : totalRecords,
        pages: pages,
        Candidates: report,
      });}

   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.getAdminReportInDetail = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;  
    let limit = parseInt(req.query.limit) || 10;  
    let offset = (page - 1) * limit; 
    const dateFromParams = req.query.date;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }
    if(!dateFromParams){
      return res.status(404).json({error: "Date not found"});
    }


    const {
      company,
      position,
      orderBy,
      orderDirection,
      recruiter,
    } = filter;

    const whereClause = {
      sourcing_date: dateFromParams,
      sourcing_status: "Sent To Client",
    };

    const companyFilter={};
    const positionFilter ={};

    if(recruiter){
      whereClause.created_by= recruiter;
    }

    if (company) {
      companyFilter.company_name = { [Op.like]: `%${company}%` };
    }

    if (position) {
      positionFilter.position = { [Op.like]: `%${position}%` };
    }

    let order =[[Sequelize.col("Position.position"), "ASC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        company_name: "Position.Company.company_name",
        position: "Position.position",
      };

      if (validColumns[orderBy]) {
        order = [[Sequelize.col(validColumns[orderBy]), orderDirection]];
      }
    }

    const [report, totalRecords] = await Promise.all([
      await Candidate.findAll({
        attributes: [
          "created_by",
          [Sequelize.fn("COUNT", Sequelize.col("Candidates.id")), "candidate_count"],
          [Sequelize.col("Candidates.sourcing_date"), "sourcing_date"],
          [Sequelize.col("Position.id"), "position_id"],
          [Sequelize.col("Position.company_id"), "company_id"],
          [Sequelize.col("Position.position"), "position_name"],
          [Sequelize.col("Position.Company.company_name"), "company_name"],
          [Sequelize.col("User.id"), "id"],
          [Sequelize.col("User.name"), "recruiter_name"],
        ],
        include: [
          {
            model: Position,
            required: true,
            attributes: [],
            where: positionFilter,
            include: [
              {
                model: Company,
                required: true,
                attributes: [],
               where:companyFilter
              },
            ],
          },
          {
            model :User,
            required: true,
            attributes: [],
          }
        ],
        where:whereClause,
        group: [
          "Position.id",
          "Position.company_id",
          "Position.position",
          "Candidates.sourcing_date",
          "Position.Company.company_name",
          "User.id",
          "User.name",
        ],
        order:order,
        limit,
        offset
      }),
      await Candidate.findAll({
        attributes: [
          "created_by",
          [Sequelize.fn("COUNT", Sequelize.col("Candidates.id")), "candidate_count"],
          [Sequelize.col("Candidates.sourcing_date"), "sourcing_date"],
          [Sequelize.col("Position.id"), "position_id"],
          [Sequelize.col("Position.company_id"), "company_id"],
          [Sequelize.col("Position.position"), "position_name"],
          [Sequelize.col("Position.Company.company_name"), "company_name"],
          [Sequelize.col("User.id"), "id"],
          [Sequelize.col("User.name"), "recruiter_name"],
        ],
        include: [
          {
            model: Position,
            required: true,
            attributes: [],
           where: positionFilter,
            include: [
              {
                model: Company,
                required: true,
                attributes: [],
               where:companyFilter
              },
            ],
          },
          {
            model :User,
            required: true,
            attributes: [],
          }
        ],
        where:whereClause,
        group: [
          "Position.id",
          "Position.company_id",
          "Position.position",
          "Candidates.sourcing_date",
          "Position.Company.company_name",
          "User.id",
          "User.name",
        ],
      })
    ]);

    if(download){
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("dailyadminreport");

      // Add headers to the worksheet

      const headerRow = worksheet.addRow([
        "Sr. No.",
        "Date",
        "Recruiter Name",
        "Company Name",
        "Company Position",
        "Total CV Sent"
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
          re.getDataValue('sourcing_date'),
          re.getDataValue('recruiter_name'),
          re.getDataValue('company_name'),
          re.getDataValue('position_name'),
          re.getDataValue('candidate_count'),
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_admindailyreport.xlsx`;

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
    
    const pages = Math.ceil(totalRecords.length / limit);
    res.status(200).json({message: 'report fetched successfully!',
      totalRecords: totalRecords.length,
      pages: pages,
      report: report
    });	
  }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};