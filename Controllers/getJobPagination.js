const db = require("../Models/db");
const Jobs = require("../Models/jobDetails");
const Positions = require("../Models/allPositions");
const Company = require("../Models/companyDetails");
const { Op,Sequelize } = require("sequelize");
const Users = require("../Models/userDetails");
const assignRecruiter = require("../Models/assignRecruiter");
const assignRecruiterLogs = require('../Models/assignRecruiterLogs');
const excel = require("exceljs");

Company.hasMany(Positions, { foreignKey: "company_id" });
Positions.belongsTo(Company, { foreignKey: "company_id" });

Positions.hasMany(assignRecruiter, { foreignKey: "position_id" });
assignRecruiter.belongsTo(Positions, { foreignKey: "position_id" });

Positions.hasMany(assignRecruiterLogs, { foreignKey: "position_id" });
assignRecruiterLogs.belongsTo(Positions, { foreignKey: "position_id" });

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

assignRecruiterLogs.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiterLogs, { foreignKey: "recruiter_id" });

exports.getJobByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    console.log(filter);

    const {
      position,
      company,
      location,
      gender,
      qualification,
      recruiterId,
      orderBy,
      orderDirection,
      notAssigned,
      positionStatus,
      fromDate,
      toDate,
    } = filter;

    // const position = req.query.position;
    // const companyName = req.query.companyName;
    // const location = req.query.location;
    // const industryName = req.query.industryName;
    //const assignRecruiter = req.query.assignRecruiter;

    //console.log(position, company, location, gender, qualification, recruiterId, notAssigned, fromDate, toDate);

    const companyFilters = {};
    if (company) {
      companyFilters.company_name = { [Op.like]: `%${company}%` };
    }
    // if (industryName) {
    //   companyFilters.industry = { [Op.like]: `%${industryName}%` };
    // }

    // const positionFilter = position
    //   ? { position: { [Op.like]: `%${position}%` } }
    //   : {};

    // const locationFilter = location
    //   ? { location: { [Op.like]: `%${location}%` } }
    //   : {};

    //   const genderFilter = gender?{gender_pref:{[Op.like]:`%${gender}%`}}:{};
    //   const qualificationFilter = qualification?{qualification:{[Op.like]:`%${qualification}%`}}:{};
    //   const recruiterIdFilter = recruiterId?{recruiter_assign:{[Op.like]:`%${recruiterId}%`}}:{};

    const whereClause = {};
    if (position) whereClause.position = { [Op.like]: `%${position}%` };
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (gender && gender ==="Male") whereClause.gender_pref = "Male";
    if (gender && gender ==="Female") whereClause.gender_pref = "Female";
    if(gender && gender ==="No preference") whereClause.gender_pref = "No preference";

    if (qualification)
      whereClause.qualification = { [Op.like]: `%${qualification}%` };

    if (fromDate) whereClause.upload_date = { [Op.gte]: `%${fromDate}%` };

    const assignRecruiterFilters = {
     // active:1,
    };
    
    if (recruiterId && recruiterId !== "Not Assigned" && recruiterId !== "Only Assigned") {
      assignRecruiterFilters.recruiter_id = recruiterId;
       
    }
    if(recruiterId && recruiterId === "Not Assigned") {
      whereClause.recruiter_assign = 0;
    }
    if(recruiterId && recruiterId === "Only Assigned") {
      whereClause.recruiter_assign = 1;
    }

    
      
    // if (positionStatus)
    //   whereClause.position_status = { [Op.like]: `%${positionStatus}` };
    if (positionStatus && positionStatus!=="" && positionStatus !== "All") {
      whereClause.position_status = { [Op.like]: `%${positionStatus}%` };
    } else if (!positionStatus || positionStatus==="") {
      whereClause.position_status = "Open";
    }

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.upload_date = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      whereClause.upload_date = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.upload_date = {
        [Op.lte]: toDate,
      };
    }

    // console.log("Where clause:", whereClause);
    // console.log("Company filters:", companyFilters);
    let order = [["upload_date", "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        upload_date: "upload_date",  
        company_name: "company_name",
        position: "position",
        max_ctc: Sequelize.literal("CAST(SUBSTRING_INDEX(max_ctc, ' ', 1) AS DECIMAL(10, 2))"),
      };

       if(orderBy === 'ctc' && validColumns[orderBy]){
        order = [[validColumns[orderBy], orderDirection]];

       }else if (validColumns[orderBy]) {
        order = [[Sequelize.literal(validColumns[orderBy]), orderDirection]];
      }
    }

    const [job, totalRecords] = await Promise.all([
      Positions.findAll({
        include: [
          {
            model: Company,
            required: true,
            where: companyFilters,
          },
          {
            model: assignRecruiter,
            required: recruiterId && recruiterId !== "Not Assigned"? true :false, // Include all positions, even if they don't have an assigned recruiter
            attributes: ["recruiter_id"],
            where: assignRecruiterFilters,
            include: [
              {
                model: Users,
                attributes: ["name"], // Fetch recruiter names
              },
            ],
          },
        ],
        where: whereClause,
        limit,
        order:order,
        offset,
      }),
      Positions.count({
        include: [
          {
            model: Company,
            required: true,
            where: companyFilters,
          },
          {
            model: Users,

            attributes: ["name"],
          },
        ],
        where: whereClause,
      }),
    ]);
    let records = job.length;

    const pages = Math.ceil( totalRecords / limit);
    res.status(200).json({
      totalRecords: totalRecords,
      pages: pages,
      data: [...job],
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};

exports.updatePositionStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { position_status } = req.body;

    await Positions.update({ position_status }, { where: { id: id } });

    return res.status(200).json({
      success: "Position status changed sucessfully",
      Position: { id, position_status },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};


exports.getAssignRecuitersLog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }
    const {
      position,
      company,
      orderBy,
      orderDirection,
      positionStatus,
      recruiterStatus,
      recruiter,
      fromDate,
      toDate,
    } = filter;

    const whereClause={};
    const positionFilters={};
    const companyFilters={};
    const RecruiterFilters={};

    if (position) positionFilters.position = { [Op.like]: `%${position}%` };
    if (company) {
      companyFilters.company_name = { [Op.like]: `%${company}%` };
    }
    if (recruiter) {
      RecruiterFilters.id =  recruiter;
    }

    // if (positionStatus && positionStatus!=="" && positionStatus !== "All") {
    //   whereClause.position_status = { [Op.like]: `%${positionStatus}%` };
    // } else if (!positionStatus || positionStatus==="") {
    //   whereClause.position_status = "Open";
    // }

   if(recruiterStatus && recruiterStatus !== "" && recruiterStatus !== 'All') {
      whereClause.active = recruiterStatus;
   }else if(!recruiterStatus || recruiterStatus === '') {
    whereClause.active =1;
    }

    if (fromDate && toDate) {
      let theDate = parseInt(toDate.split("-")[2]) + 1;
      let newDate = toDate.slice(0, 8) + theDate.toString().padStart(2, "0");
      whereClause.assigned_at = {
        [Op.between]: [fromDate, newDate],
      };
    } else if (fromDate) {
      whereClause.assigned_at = {
        [Op.gte]: fromDate,
      };
    } else if (toDate) {
      whereClause.assigned_at = {
        [Op.lte]: toDate,
      };
    }

    let order =[[Sequelize.col("created_at"), "DESC"]];

    if (orderBy && orderDirection) {
      const validColumns = {
        assigned_at: "created_at",
        company_name: "Position.Company.company_name",
        position: "Position.position",
        recruiter: "User.name",
        removed_at:"removed_at"
      };

      if (validColumns[orderBy]) {
        order = [[Sequelize.col(validColumns[orderBy]), orderDirection]];
      }
    }
    
   const [report, totalRecords] = await Promise.all([
    assignRecruiterLogs.findAll({
      include: [
        {
          model:Positions,
          attributes:['id','position'],
          required: true,
          where: positionFilters,
          include:[
            {
              model:Company,
              attributes:['id','company_name'],
              required: true,
              where: companyFilters,
            }
          ]
        },
        {
          model: Users,
           required:true,
          where: RecruiterFilters,
         attributes: ["name"],
            
        },
      ],
       limit,
       offset,
       order:order,
       where: whereClause
    }),

    assignRecruiterLogs.count({
      include: [
        {
          model:Positions,
          attributes:['id','position'],
          required: true,
          where: positionFilters,
          include:[
            {
              model:Company,
              attributes:['id','company_name'],
              required: true,
              where: companyFilters,
            }
          ]
        },
        {
          model: Users,
          required:true,
          where: RecruiterFilters,
         attributes: ["name"],
        },
      ],
      where: whereClause,
    })
   ]);

   if(download){
    // Create Excel workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("assign recuiter log");

    // Add headers to the worksheet

    const headerRow = worksheet.addRow([
      "Sr. No.",
      "Assigned Date",
      "End Date",
      "Recruiter Name",
      "Company Name",
      "Company Position",
      "Remarks"
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
        re.assigned_at,
        re.removed_at ? re.removed_at : "On going",
        re.User?.name,
        re.Position.Company.company_name,
        re.Position.position,
        re.remarks
      ]);
    });

    // Generate a unique filename for the Excel file

    const filename = `Exported_atspositionwisecount.xlsx`;

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
   const pages = Math.ceil( totalRecords  / limit);
   return res.status(200).json({
     totalRecords: totalRecords,
     pages: pages,
     data: [...report],
     
   });
  }
  } catch (error) {

    console.error('Error getting assigned recruiters log:', error);
    return res.status(500).json({ error: 'Internal server error', msg: error.message });
  }
};