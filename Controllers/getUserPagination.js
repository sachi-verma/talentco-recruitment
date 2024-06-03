const db = require("../Models/db");
const Users = require("../Models/userDetails");
const { Op } = require("sequelize");

exports.getUserByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

    const name = req.query.name;
    const designation = req.query.designation;
    const nameFilter = name ? { name: { [Op.like]: `%${name}%` } } : {};
    const designationFilter = designation
      ? { designation: { [Op.like]: `%${designation}%` } }
      : {};

    const users = await Users.findAll({
      where: { ...nameFilter, ...designationFilter },

      limit,
      offset,
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
