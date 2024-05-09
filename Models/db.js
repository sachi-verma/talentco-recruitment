// const mysql2 = require('mysql2');
const { Sequelize} = require('sequelize');
// require("dotenv").config();
const config = require('../Config/config')

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASS,{
    dialect: 'mysql',
    host: config.db.DB_HOST,
    define: {
      timestamps: false,
      underscored: true,
    },
    pool: {
            max: config.db.pool.max,
            min: config.db.pool.min,
            acquire: config.db.pool.acquire,
            idle: config.db.pool.idle
          }
  }
);

// sequelize.sync()

const connectToDb = async () => {
  try{
    await sequelize.authenticate();
    console.log("successfully connected to the database")
  }
  catch(error){
    console.log(error);
  }
}


module.exports = {sequelize, connectToDb}

// const db = {};

// db.Sequelize = Sequelize;
// db.Op = Op;
// db.sequelize = sequelize;



// const db = mysql2.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DBNAME
// });

// db.connect(err => {
//     if (err) {
//         console.error('Error connecting to MySQL: ' + err.stack);
//         return;
//     }
//     console.log('Connected to MySQL as id ' + db.threadId);
// });

// module.exports = db;
