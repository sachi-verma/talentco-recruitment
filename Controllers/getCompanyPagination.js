const db = require("../Models/db");
const Companys = require("../Models/companyDetails");
const { Op } = require("sequelize");

exports.getCompanyByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const offset = (page - 1) * limit; // Calculate offset based on page number

    const companyName = req.query.companyName;
    const industryName = req.query.industryName;

    const filters = {};
    if (companyName) {
      filters.company_name = { [Op.like]: `%${companyName}%` };
    }
    if (industryName) {
      filters.industry = { [Op.like]: `%${industryName}%` };
    }

const [company, totalRecords] = await Promise.all([
  await Companys.findAll({
    where: filters,
    limit,
    offset,
  }),
  await Companys.count({
    where: filters,
     
  })

]);

    // const company = await Companys.findAll({
    //   where: filters,
    //   limit,
    //   offset,
    // });

    const pages = Math.ceil(totalRecords/limit);
    res.status(200).json({totalRecords:totalRecords, pages:pages, data:[...company]});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("500 server error");
  }
};
