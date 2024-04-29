const express = require('express');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
require("dotenv").config();
const { allowedNodeEnvironmentFlags } = require('process');

const app = express();
// const port = 3000;
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});

app.post('/role', (req, res) => {
    const { role_id, role_name } = req.body;
  
    db.query(
      'INSERT INTO roles (role_id, role_name) VALUES (?,?)',
      [role_id, role_name],
      (err, results) => {
        if (err) {
          console.error('MySQL error:', err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log(results);
          res.status(200).json({ message: 'Role created successfully' });
        }
      }
    );
  });

app.post('/companyregistration', (req,res) => {
  const {company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role_id} = req.body;

  db.query(
    'INSERT INTO company_details (company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role_id) VALUES ?', [company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role_id],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(results);
        res.status(201).json({ message: 'Resume created successfully' });
      }
    }
  );
});

 // Start the server
 app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  });
 