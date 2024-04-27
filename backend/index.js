const express = require('express');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mysql2 = require('mysql2');
const { allowedNodeEnvironmentFlags } = require('process');

const app = express();
// const port = 3000;
const port = process.env.PORT;

app.use(cors());

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
    const { id, role_id, role } = req.body;
  
    db.query(
      'INSERT INTO roles (role_id, role) VALUES ?',
      [id, role_id, role],
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

app.post('/companyregistration', (req,res) => {
  const {company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role} = req.body;

  db.query(
    'INSERT INTO company_details (company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role) VALUES ?', [company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, username, password, role],
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
 