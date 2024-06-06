const Positions = require("../Models/allPositions");
const Users = require("../Models/userDetails");
const excel = require("exceljs");

exports.getRecruiterByPage = async (req, res) => {
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

    const { name, designation, email, phone, fromDate, toDate}= filter;
    const whereClause={
       role_id:"2",
      };

if (name) whereClause.name = { [Op.like]: `%${name}%` };
if (designation) whereClause.designation = { [Op.like]: `%${designation}%` };
if (email) whereClause.email = { [Op.like]: `%${email}%` };
if (phone) whereClause.phone = { [Op.like]: `%${phone}%` };

const [users, totalRecords]= await Promise.all([

  await Users.findAll({
    where: whereClause,
    limit,
    offset,
  }),

  await Users.count({
    where: whereClause,
  })

]);

      // const users = await Users.findAll({
      //   where: { role_id: "17" },
      //   limit,
      //   offset,
      // });

      if(download){
        // Create Excel workbook and worksheet
       const workbook = new excel.Workbook();
       const worksheet = workbook.addWorksheet("Recruiters");
 
       // Add headers to the worksheet
       worksheet.addRow([
         "Recruiter Name",
         "Designation",
         "Email",
         "Phone Number",
          
       ]);
 
       // Add data rows to the worksheet
       users.forEach((users) => {
         worksheet.addRow([
          users.name,
           users.designation,
           users.email,
           users.phone,
         ]);
       });
 
       // Generate a unique filename for the Excel file
 
       const filename = `Exported_Recruiters.xlsx`;
 
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
        let records = users.length;

        const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
  
        res.status(200).json({users: users, totalRecords: filter ? records: totalRecords, pages: pages});
      }
     
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("500 server error");
    }
  };