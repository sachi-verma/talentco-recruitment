const db = require("../Models/db");
const Companys = require("../Models/companyDetails");
const { Op } = require("sequelize");
const excel = require("exceljs");

const Roles = require("../Models/roles");
const Users = require("../Models/userDetails");
const assignRecruiter = require("../Models/assignRecruiter");
const Positions = require('../Models/allPositions')

assignRecruiter.belongsTo(Users, { foreignKey: "recruiter_id" });
Users.hasMany(assignRecruiter, { foreignKey: "recruiter_id" });

exports.getCompanyByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter):"";

    const { company, industry, fromDate, toDate}= filter;


    const filters = {};
    if (company) {
      filters.company_name = { [Op.like]: `%${company}%` };
    }
    if (industry) {
      filters.industry = { [Op.like]: `%${industry}%` };
    }

//     const userId = req.query.id; 
// const user = await Users.findByPk(userId);

// if (!user) {
//     console.error("User not found");
//     return;
// }

// const role_id = user.role_id;
// const role = await Roles.findOne({ where: { id: role_id } });

// if (!role) {
//     console.error("Role not found");
//     return;
// }

// console.log(role.role_name);

// const recruiterFilter = {};

// if (role.role_name === "Recruiter") {
//     recruiterFilter.recruiter_id = userId;
// }

// const positions = await assignRecruiter.findAll({
//     where: { recruiter_id: userId },
//     attributes: ['position_id']
// });

// if (!positions || positions.length === 0) {
//     console.log("No positions found");
//     return;
// }

// console.log(positions.map(position => position.position_id));

// let companiesId = [];

// for (let position of positions) {
//     let company = await Positions.findOne({ where: { id: position.position_id } });
//     if (company) {
//         companiesId.push(company);
//     }
// }

// console.log(companiesId.map(company => company.company_id));

// let companyDetails = [];

// for (let com of companiesId) {
//   let company =  await Companys.findOne({where:{id: com.company_id}});
//   companyDetails.push(company);
// };

// let total_companies = companyDetails.length;

// const companiesTosent = companyDetails.map(companyDetail => ({
//   id: companyDetail.id,
//   name: companyDetail.company_name
// }));
// console.log(companyDetails);


const [companys, totalRecords] = await Promise.all([
  await Companys.findAll({
    where: filters,
    limit,
    offset,
  }),
  await Companys.count()

]);

    // const company = await Companys.findAll({
    //   where: filters,
    //   limit,
    //   offset,
    // });


    if(download){
       // Create Excel workbook and worksheet
       const workbook = new excel.Workbook();
       const worksheet = workbook.addWorksheet("company");
 
       // Add headers to the worksheet
       worksheet.addRow([
         "Company Name",
         "Industry Name",
         "Address",
         "Person One Name",
         "Person One Designation",
         "Person One Contact No",
         "Person One Email",
         "Person Two Name",
         "Person Two Designation",
         "Person Two Contact No",
         "Person Two Email",
          "Summary"
       ]);
 
       // Add data rows to the worksheet
       companys.forEach((companys) => {
         worksheet.addRow([
          companys.company_name,
           companys.industry,
           companys.address,
           companys.poc1_name,
           companys.poc1_designation,
           companys.poc1_phone,
           companys.poc1_email,
           companys.poc2_name,
           companys.poc2_designation,
           companys.poc2_phone,
           companys.poc2_email, 
           companys.summary
         ]);
       });
 
       // Generate a unique filename for the Excel file
 
       const filename = `Exported_Company.xlsx`;
 
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
      let records = companys.length;

      const pages = Math.ceil( filter? records/ limit: totalRecords / limit);
  
      res.status(200).json({totalRecords: filter? records: totalRecords, pages:pages, data: [...companys]});
    }
   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
