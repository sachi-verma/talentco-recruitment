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
        "Experience",
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
          report.Position.experience,
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
    } else if (fromDate) {
      whereClause.update_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.update_date = {
        [Op.lte]: toDate,
      };
    }

   let report;
   let totalRecords;
    if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
        [report, totalRecords] = await Promise.all([
        
        await sourcingReportByRecruiter.findAll({where:recruiterFilter , limit, offset}),
        await sourcingReportByRecruiter.count({where:recruiterFilter}),
      ]);
    } else{

        [report, totalRecords] = await Promise.all([
        await Update.findAll({ where: whereClause, limit, offset }),
        await Update.count({ limit, offset }),
        
         
      ]);

    }

   
   

    if (download){
        // Create Excel workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("filtered Update");
  
        // Add headers to the worksheet
  
        worksheet.addRow([
          "Date",
          "Total CV Sourced",
          "Total CV Relevent",
          "Total Confirmation Pending",
          "Total Sent to client",
          
        ]);
  
        // Add data rows to the worksheet
        report.forEach((report) => {
          worksheet.addRow([
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
      offset,
    });

    if(download){
         // Create Excel workbook and worksheet
         const workbook = new excel.Workbook();
         const worksheet = workbook.addWorksheet("Admin report");
   
         // Add headers to the worksheet
         worksheet.addRow([
           "Date",
           "Position",
           "Recruiter Name",
           "Total CV Sent ",
           "Company Name",
         ]);
   
         // Add data rows to the worksheet
         report.forEach((reportItem) => {
           worksheet.addRow([
             reportItem.dataValues.date,
             reportItem.Position.position,
             reportItem.Position.User?.name,
             reportItem.dataValues.sentToClientCount,
             reportItem.Position.Company.company_name
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
