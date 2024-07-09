const db = require("../Models/db");
const Users = require("../Models/userDetails");
const { Op } = require("sequelize");
const excel = require("exceljs");
const Roles = require("../Models/roles");

exports.getUserByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const download = req.query.download ? true : false;

    if (download) {
      limit = null;
      offset = null;
    }

    const userId = req.query.id;
    const user = await Users.findByPk(userId);
    let role_id;
    let role;
    

    const filter = req.query.filter ? JSON.parse(req.query.filter) : "";

    const { name, designation, email, phone, fromDate, toDate } = filter;
    const whereClause = {};

    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (designation)
      whereClause.designation = { [Op.like]: `%${designation}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (phone) whereClause.phone = { [Op.like]: `%${phone}%` };

    const [users, totalRecords] = await Promise.all([
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
      users.forEach((user, index) => {
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

     
      if (user) {
        role_id = user.role_id;
  
        role = await Roles.findOne({ where: { id: role_id } });
        console.log("Role Name: ", role.role_name);
  
        if (role &&(role.role_name === "Super Admin")) {
          let records = users.length;
          const pages = Math.ceil(filter ? records / limit : totalRecords / limit);
    
          res
          .status(200)
          .json({
            totalRecords: filter ? records : totalRecords, 
            pages: pages,
            user: users,
          });
           
        }
      } 
     
        const superAdminRole = await Roles.findOne({ where: { role_name: "Super Admin" } });
        const superAdminRoleId = superAdminRole ? superAdminRole.id : null;

        const filteredUsers = superAdminRoleId ? users.filter(val => val.role_id !== superAdminRoleId) : users;
       // console.log("======>>>>",filteredUsers);

        const pages = Math.ceil(filter ? filteredUsers / limit : filteredUsers.length / limit);

      res
        .status(200)
        .json({
          totalRecords: filter ? filteredUsers.length : totalRecords -1,
          pages: pages,
          user: filteredUsers,
        });
    }
   
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
