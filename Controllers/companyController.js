const db = require('../Models/db');

exports.registerCompany = (req, res) => {
  const { company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id } = req.body;

  db.query(
    'INSERT INTO company_details (company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [company_id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(results);
        res.status(200).json({ message: 'Company created successfully' });
      }
    }
  );
};

exports.getCompany = (req,res) => {
    db.query('SELECT * FROM company_details', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
      });
}
