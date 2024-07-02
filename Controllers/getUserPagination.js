const db = require("../Models/db");
const Users = require("../Models/userDetails");
const { Op } = require("sequelize");
const excel = require("exceljs");

exports.getUserByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const { name, designation, email, phone, fromDate, toDate } = filter;
    const whereClause = {};

    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (designation)
      whereClause.designation = { [Op.like]: `%${designation}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (phone) whereClause.phone = { [Op.like]: `%${phone}%` };

    const [user, totalRecords] = await Promise.all([
      await Users.findAll({
        where: whereClause,
        limit,
        offset,
      }),

      await Users.count(),
    ]);

    if(download){

       // Create Excel workbook and worksheet
       const workbook = new excel.Workbook();
       const worksheet = workbook.addWorksheet("Users");
 
       // Add headers to the worksheet
       const headerRow = worksheet.addRow([
        "Sr No.",
        "Name",
        "Designation",
        "Email",
        "Phone Number",
         
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
      user.forEach((user, index) => {
        worksheet.addRow([
          index +1,
          user.name,
          user.designation,
          user.email,
          user.phone,
        ]);
      });
       // Generate a unique filename for the Excel file
 
       const filename = `Exported_User.xlsx`;
 
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
      let records = user.length;

      const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
  
      res
        .status(200)
        .json({
          totalRecords: filter ? records : totalRecords,
          pages: pages,
          user: user,
        });
    }
   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
