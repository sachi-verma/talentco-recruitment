const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const db = require("../Models/db");
const { Op, fn, col, where } = require("sequelize");
const excel = require("exceljs");
const Roles = require("../Models/roles");
const Users = require("../Models/userDetails");
const assignRecruiter = require("../Models/assignRecruiter");

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

Users.hasMany(Candidate, { foreignKey: 'created_by' });
Candidate.belongsTo(Users, { foreignKey: 'created_by' });

exports.getSourcingReportByDate = async (req, res) => {
  try {
    const dateFromParams = req.query.date;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const userId = req.query.id; 

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const {
      position,
      company,
      candidate,
      cvSourcedFrom,
      relevant,
      orderBy,
      orderDirection,
      status,
      location,
    } = filter;

    console.log(
      position,
      company,
      candidate,
      cvSourcedFrom,
      relevant,
      status,
      location
    );

    const companyFilters = {};
    if (company) {
      companyFilters.company_name = { [Op.like]: `%${company}%` };
    }
   

    const positionFilter = {};
    if (position) {
      positionFilter.position = { [Op.like]: `%${position}%` };
    }
    if (location) {
      positionFilter.location = { [Op.like]: `%${location}%` };
    }

    const whereClause = {
      sourcing_date: dateFromParams,
    };

    // [Op.and]: [
    //     where(fn('DATE', col('Candidates.created_at')), dateFromParams)
    // ]
    // if (candidate) whereClause[Op.and].push({ candidate: { [Op.like]: `%${candidate}%` } });
    // if (cvSourcedFrom) whereClause[Op.and].push({ cv_sourced_from: { [Op.like]: `%${cvSourcedFrom}%` } });
    // if (relevant) whereClause[Op.and].push({ relevant: { [Op.like]: `%${relevant}%` } });
    // if (status) whereClause[Op.and].push({ sourcing_status: { [Op.like]: `%${status}%` } });

    if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };
    if (cvSourcedFrom)
      whereClause.cv_sourced_from = { [Op.like]: `%${cvSourcedFrom}%` };
    if (relevant) whereClause.relevant = { [Op.like]: `%${relevant}%` };
    if (status) whereClause.sourcing_status = { [Op.like]: `%${status}%` };

    const user = await Users.findByPk(userId);
    let role;
    let role_id;
    const recruiterFilter={};

    if (user) {
      role_id = user.role_id;
      console.log("========>", role_id, user);
  
      if (role_id) {
        role = await Roles.findOne({ where: { id: role_id } });
        console.log("=========>>>>>>>>>>>>>>", role);
  
        if (role && (role.role_name === "Recruiter" || role.role_name === "Team Lead")) {
          whereClause.created_by = userId;
        }
      }
    }

    let order = [["candidate", "ASC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        candidate: "candidate",
        company_name: "company_name",
        position: "position", 
      };
       
      if (validColumns[orderBy]) {
        order = [[Sequelize.literal(validColumns[orderBy]), orderDirection]];
      }
    }

    const [report, totalRecords] = await Promise.all([
      await Candidate.findAll({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
          "candidate_alt_phone",
          "candidate_email",
          "candidate_location",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_expected_ctc",
          "candidate_notice_period",
          "candidate_qualification",
          "candidate_organization",
          "candidate_designation",
          "candidate_gender",
          "cv_sourced_from",
          "candidate_resume",
          "sourcing_date",
          "sourcing_status",
          "relevant",
          "candidate_status",
          "candidate_remarks",
          "remarks",
          "created_at",
          "created_by",
          "updated_at",
          "sent_to_client_date"
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
                where: companyFilters,
              },
              // {
              //   model: assignRecruiter,
              //   required: true, // Set to false if a position can have no recruiters assigned
              //   attributes: ["recruiter_id"],
              //   where: recruiterFilter,
              //   include: [
              //     {
              //       model: Users,
              //       attributes: ["name"], // Fetch recruiter names
              //     },
              //   ],
              // },
            ],
            where: positionFilter,
          },
          {
            model: Users,
            required : true,
            attributes:['id', 'name','phone', 'email'],
          }
        ],
        where: whereClause,
        order:order,
        limit,
        offset,
      }),

      await Candidate.findAll({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
          "candidate_alt_phone",
          "candidate_email",
          "candidate_location",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_expected_ctc",
          "candidate_notice_period",
          "candidate_qualification",
          "candidate_organization",
          "candidate_designation",
          "candidate_gender",
          "cv_sourced_from",
          "candidate_resume",
          "sourcing_date",
          "sourcing_status",
          "relevant",
          "candidate_status",
          "candidate_remarks",
          "remarks",
          "created_at",
          "created_by",
          "updated_at",
          "sent_to_client_date"
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
            where: positionFilter,
            include: [
              {
                model: Company,
                required: true,
                attributes: ["company_name"],
                where: companyFilters,
              },
              // {
              //   model: assignRecruiter,
              //   required: true, // Set to false if a position can have no recruiters assigned
              //   attributes: ["recruiter_id"],
              //   where: recruiterFilter,
              //   include: [
              //     {
              //       model: Users,
              //       attributes: ["name"], // Fetch recruiter names
              //     },
              //   ],
              // },
            ],
          },
          {
            model: Users,
            required : true,
            attributes:['id', 'name','phone', 'email'],
          }
        ],
        where: whereClause,
      }),
    ]);

    if (download) {
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("DailySourcing");

      // Add headers to the worksheet
    const headerRow =  worksheet.addRow([
        "Sr. No.",
        "Sourcing Date",
        "Candidate",
        "Company",
        "Position",
        "Location",
        "Min CTC",
        "Max CTC",
        "CV Sourced From",
        "Remarks",
        "Relevent",
        "Sourcing Status",  
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
          report.sourcing_date,
          report.candidate,
          report.Position.Company.company_name,
          report.Position.position,
          report.Position.location,
          report.Position.min_ctc,
          report.Position.max_ctc,
          report.cv_sourced_from,
          report.candidate_remarks,
          report.relevant,
          report.sourcing_status, 
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_sourcingReportof${dateFromParams}.xlsx`;

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
      const pages = Math.ceil(totalRecords.length / limit);
      res
        .status(200)
        .json({
          message: "Candidates fetched successfully",
           totalRecords: totalRecords.length,
          //totalRecords: totalRecords,
          pages: pages,
          Candidates: report,
        });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
