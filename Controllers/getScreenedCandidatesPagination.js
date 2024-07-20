const db = require("../Models/db");
const { Op, Sequelize } = require("sequelize");
const Report = require("../Models/dailySourcingReport");
const Update = require("../Models/dailySourcingUpdate");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const AdminUpdate = require("../Models/dailyAdminUpdate");
const User = require("../Models/userDetails");
const excel = require("exceljs");

Position.hasMany(Candidate, { foreignKey: "position" });
Candidate.belongsTo(Position, { foreignKey: "position" });

Company.hasMany(Position, { foreignKey: "company_id" });
Position.belongsTo(Company, { foreignKey: "company_id" });

// User.hasMany(Position, { foreignKey: "recruiter_assign" });
// Position.belongsTo(User, { foreignKey: "recruiter_assign" });

User.hasMany(Candidate, { foreignKey: "created_by" });
Candidate.belongsTo(User, { foreignKey: "created_by" });

exports.getScreenedCandidatePagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const { position, company, location, candidate, fromDate, toDate, orderBy, orderDirection, recruiter } = filter;

    const whereClause = {
      sourcing_status: "Screened",
    };

    const companyFilters = {};

    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (company) companyFilters.company_name = { [Op.like]: `%${company}%` };
    if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };

    const positionFilter = {};
    if (position) positionFilter.position = { [Op.like]: `%${position}%` };

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
    if (recruiter) {
      whereClause.created_by = recruiter;
    }
    let order = [["sourcing_date", "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        sourcing_date: "Candidates.sourcing_date",  
        candidate: "Candidates.candidate",
        company_name: "company_name",
        position: "position",
      };
       
      if (validColumns[orderBy]) {
        order = [[Sequelize.literal(validColumns[orderBy]), orderDirection]];
      }
    }

    const [candidates, totalRecords] = await Promise.all([
      await Candidate.findAll({
        include: [
          {
            model: Position,
            required: true,
            attributes: ["company_id", "position", "location"],
            where: positionFilter,
            include: [
              {
                model: Company,
                required: true,
                attributes: {
                  exclude: ["company_username", "company_password", "role_id"],
                },
                where: companyFilters,
              },
              
            ],
          },
          {
            model: User,
            required: true,
            attributes: ["id","name"],
          },
        ],
        where: whereClause,
        limit,
        offset,
        order: order
      }),

      await Candidate.count({
        include: [
          {
            model: Position,
            required: true,
            attributes: ["company_id", "position", "location"],
            where: positionFilter,
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name"],
                where: companyFilters,
              },
              
            ],
          },
          {
            model: User,
            required: true,
            attributes: ["id","name"],
          },
        ],
        where: whereClause,
      }),
    ]);

    if (download) {
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("screenedcandidate");

      // Add headers to the worksheet

      const headerRow = worksheet.addRow([
        "Sr. No.",
        "Sourcing Date",
        "Recruiter Name",
        "Company Name",
        "Position Name",
        "Candidate Name",
        "Location",
        "Contact Number",
        "Current CTC",
        "Expected CTC",
        "Notice Period",
        "Experience",
        "Qualification",
        "Current Organization",
        "Current Designation",
        "Email",
        "Remarks",
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
      candidates.forEach((candidates, index) => {
        worksheet.addRow([
          index + 1,
          candidates.sourcing_date,
          candidates.User?.name,
          candidates.Position.Company.company_name,
          candidates.Position.position,
          candidates.candidate,
          candidates.candidate_location,
          candidates.candidate_phone,
          candidates.candidate_current_ctc,
          candidates.candidate_expected_ctc,
          candidates.candidate_notice_period,
          candidates.candidate_experience,
          candidates.candidate_qualification,
          candidates.candidate_organization,
          candidates.candidate_designation,
          candidates.candidate_email,
          candidates.candidate_remarks,
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_screenedCandidate.xlsx`;

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
      let records = candidates.length;

      const pages = Math.ceil(totalRecords / limit);

      res.json({
        candidates: candidates,
        pages: pages,
        totalRecords: totalRecords,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", errorMessage: error });
  }
};

exports.getPositionWiseCount = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const { fromDate, toDate, company, position, orderBy, orderDirection, recruiter } =
      filter;

      const positionFilter = {};
      const companyFilter = {};
      const whereClause = {
        sourcing_status: "Screened",
      };

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

    let order = [[Sequelize.col("Position.upload_date"), "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        upload_date: "Position.upload_date",
        company_name: "Position.Company.company_name",
        position: "Position.position",
      };

      if (validColumns[orderBy]) {
        order = [[Sequelize.col(validColumns[orderBy]), orderDirection]];
      }
    }

    const report = await Candidate.findAll({
      attributes: [
        "position",
        [Sequelize.fn("COUNT", Sequelize.col("Candidates.id")), "candidate_count"],
        [Sequelize.col("Position.id"), "position_id"],
        [Sequelize.col("Position.company_id"), "company_id"],
        [Sequelize.col("Position.position"), "position_name"],
        [Sequelize.col("Position.upload_date"), "upload_date"],
        [Sequelize.col("Position.Company.company_name"), "company_name"],
       // [Sequelize.col("User.id"), "id"],
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
        // {
        //   model :User,
        //   required: true,
        //   attributes: [],
        // }
      ],
      order: order,
      limit,
      offset,
      where:whereClause,
      group: [
        "Position.id",
        "Position.company_id",
        "Position.position",
        "Position.upload_date",
        "Position.Company.company_name",
        //"User.id"
      ],
    });
    // const report = await Position.findAll({
    //   attributes: [
    //     "id",
    //     "company_id",
    //     "position",
    //     "upload_date",
    //     [Sequelize.col("Company.company_name"), "company_name"],
    //     [
    //       Sequelize.literal(`(
    //         SELECT COUNT(*)
    //         FROM all_candidates AS Candidate
    //         WHERE Candidate.position = Positions.id AND Candidate.sourcing_status = "Screened"
    //       )`),
    //       "candidate_count",
    //     ],
    //   ],
    //   include: [
    //     {
    //       model: Company,
    //       required: true,
    //       attributes: [],
    //       where: companyFilter,
    //     },
    //   ],
    //   where: positionFilter,
    //   order: order,
    //   limit,
    //   offset,
    // });

    const pages = Math.ceil(report.length / limit);

    res.status(200).json({
      msg: "Fetched Successfully !!",
      totalRecords: report.length,
      pages: pages,
      report: report,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
