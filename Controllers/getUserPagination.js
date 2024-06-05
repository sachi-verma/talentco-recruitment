const db = require("../Models/db");
const Users = require("../Models/userDetails");
const { Op } = require("sequelize");

exports.getUserByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

  
    const filter = req.query.filter ? JSON.parse(req.query.filter):"";

    const { name, designation, email, phone, fromDate, toDate}= filter;
    const whereClause={};
    
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (designation) whereClause.designation = { [Op.like]: `%${designation}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (phone) whereClause.phone = { [Op.like]: `%${phone}%` };
    
 const [user, totalRecords] = await Promise.all([
  await Users.findAll({
    where:  whereClause,
    limit,
    offset,
  }),

  await Users.count( )

 ]);
  let records = user.length;

  const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
 
    res.status(200).json({ totalRecords: filter? records : totalRecords, pages: pages, user: user});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
