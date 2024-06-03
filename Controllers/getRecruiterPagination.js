const Positions = require("../Models/allPositions");
const Users = require("../Models/userDetails");

exports.getRecruiterByPage = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Current page, default to 1
      const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
      const offset = (page - 1) * limit; // Calculate offset based on page number
  
      const users = await Users.findAll({
        where: { role_id: "17" },
        limit,
        offset,
      });
      res.status(200).json(users);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("500 server error");
    }
  };