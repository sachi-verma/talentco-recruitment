// new controller

const db = require("../Models/db");
const { Op } = require("sequelize");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const Status = require("../Models/statusHistory");
const Users = require("../Models/userDetails");
const excel = require("exceljs");
const Roles = require("../Models/roles");
const assignRecruiter = require("../Models/assignRecruiter");

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

exports.getAtsPipelinePagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    let offset = (page - 1) * limit; // Calculate offset based on page number

    const userId = req.query.id; 

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    // const candidateName = req.query.candidateName;
    // const companyName = req.query.companyName;
    // //const position = req.query.position;
    // const startDate = req.query.startDate;
    // const endDate = req.query.endDate;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const {
      candidate,
      email,
      mobile,
      status,
      position,
      company,
      location,
      fromDate,
      toDate,
      recruiter
    } = filter;

    const whereClause = {
      sourcing_status: "Sent To Client",
    };
    if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };
    if (email)
      whereClause.candidate_email = { [Op.like]: `%${email}%` };
    if (mobile)
      whereClause.candidate_phone = { [Op.like]: `%${mobile}%` };
    if (location)
      whereClause.candidate_location = { [Op.like]: `%${location}%` };
    if (status) whereClause.candidate_status = { [Op.like]: `%${status}%` };

    //if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };

    const companyFilters = {};
    if (company) companyFilters.company_name = { [Op.like]: `%${company}%` };
    const positionFilters = {};
    if (position) positionFilters.position = { [Op.like]: `%${position}%` };

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
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.sent_to_client_date = {
        [Op.lte]: newDate,
      };
    }

    const user = await Users.findByPk(userId);
  let role_id;
  let role;
  let recruiterFilter = {};

  if (user) {
    role_id = user.role_id;
    console.log("========>", role_id, user);

    if (role_id) {
      role = await Roles.findOne({ where: { id: role_id } });
      console.log("++++++++++++++++>>>>>>>>>>>>>>", role);

      if (role && role.role_name === "Recruiter") {
        recruiterFilter.recruiter_id = userId;
      }
    }
  }
    
    if(recruiter){recruiterFilter.recruiter_id=recruiter}

    const [report, totalRecords] = await Promise.all([
      Candidate.findAll({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
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
          "sourcing_date",
          "relevant",
          "candidate_status",
          "remarks",
          "created_at",
          "updated_at",
          "sent_to_client_date"
        ],
        include: [
          {
            model: Position,
            required: true,
            where: positionFilters,
            attributes: [
              "id",
              "company_id",
              "position",
              "location",
              "recruiter_assign",
              "experience",
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
              {
                model: assignRecruiter,
                required: role && role.role_name ==="Recruiter"|| recruiter ? true: false, // Set to false if a position can have no recruiters assigned
                attributes: ["recruiter_id"],
                where: recruiterFilter,
                include: [
                  {
                    model: Users,
                    attributes: ["name"], // Fetch recruiter names
                  },
                ],
              },
            ],
          },
        ],
        where: whereClause,
        // parameters

        limit,
        offset,
      }),
      Candidate.count({
        attributes: [
          "id",
          "candidate",
          "position",
          "candidate_phone",
          "candidate_email",
          "candidate_location",
          "candidate_experience",
          "candidate_current_ctc",
          "candidate_qualification",
          "candidate_gender",
          "cv_sourced_from",
          "sourcing_date",
          "relevant",
          "candidate_status",
          "remarks",
          "created_at",
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
              "experience",
              "recruiter_assign",
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
              {
                model: assignRecruiter,
                required: role && role.role_name ==="Recruiter"|| recruiter? true: false, // Set to false if a position can have no recruiters assigned
                attributes: ["recruiter_id"],
                where: recruiterFilter,
                include: [
                  {
                    model: Users,
                    attributes: ["name"], // Fetch recruiter names
                  },
                ],
              },
            ],
          },
        ],
        where: whereClause,
        // parameters
      }),
    ]);

    // const report = await Candidate.findAll({
    //   attributes: [
    //     "id",
    //     "candidate",
    //     "position",
    //     "candidate_phone",
    //     "candidate_email",
    //     "candidate_location",
    //     "candidate_experience",
    //     "candidate_current_ctc",
    //     "candidate_qualification",
    //     "candidate_gender",
    //     "cv_sourced_from",
    //     "relevant",
    //     "candidate_status",
    //     "remarks",
    //     "created_at",
    //     "updated_at",
    //   ],
    //   include: [
    //     {
    //       model: Position,
    //       required: true,
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
    //   where: {
    //     sourcing_status: "Sent To Client",
    //     ...candidateNameFilter,
    //     ...companyNameFilter,
    //     ...positionFilter,
    //     ...(startDate || endDate ? { created_at: dateFilter } : {}),
    //   },
    //   // parameters

    //   limit,
    //   offset,
    // });

    if (download) {
      // Create Excel workbook and worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet("AtsPipeline");

      // Add headers to the worksheet

      worksheet.addRow([
        "Sourcing Date",
        "Candidate Status",
        "company Name",
        "Position Name",
        "Recriuter Name",
        "Candidate Name",
        "Candidate Location",
        "Contact Number",
        "Current CTC",
        "Expected CTC",
        "Notice Period",
        "Experience",
        "Current Organization",
        "Current Designation",
        "Email",
        "Remarks",
      ]);

      // Add data rows to the worksheet
      report.forEach((report) => {
        worksheet.addRow([
          report.sourcing_date,
          report.candidate_status,
          report.Position.Company.company_name,
          report.Position.position,
          report.Position.User.name,
          report.candidate,
          report.candidate_location,
          report.candidate_phone,
          report.candidate_current_ctc,
          report.candidate_expected_ctc,
          report.candidate_notice_period,
          report.candidate_experience,
          report.candidate_organization,
          report.candidate_designation,
          report.candidate_email,
          report.remarks,
        ]);
      });

      // Generate a unique filename for the Excel file

      const filename = `Exported_atspipline.xlsx`;

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

      console.log("=============>>> total", totalRecords);

      const pages = Math.ceil(filter ? records / limit : records / limit);
      res.status(200).json({
        message: "candidates fetched successfully",
        // totalRecords: filter ? records : totalRecords,
        totalRecords: records,

        pages: pages,
        Candidates: report,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.updateCandidateRemarks = async (req, res) => {

  try {
    const candidateId = req.params.id;
    const { remarks}= req.body;
    console.log("id", candidateId);

    await Candidate.update({remarks} ,{where : {id: candidateId}});
    return res.status(200).json({ success: "remarks updated sucessfully", candidate: {candidateId, remarks} }); 
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
    
  }
};