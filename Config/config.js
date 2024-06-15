require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,

  db: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USERNAME,
    DB_PASS: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_DBNAME,
    //DB_PORT: process.env.DB_PORT, 
    dialect: "mysql",

    // pool is optional, it will be used for Sequelize connection pool configuration
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  /** AUTH KEY */
//   auth: {
//     secret: "our-secret-key"
//   }
};
