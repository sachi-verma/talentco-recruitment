const db = require('../Models/db');

exports.registerCompany = (req, res) => {
  const { id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id } = req.body;

  db.query(
    'INSERT INTO company_details (id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id],
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

exports.getCompanyById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM company_details WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving company:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'company not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.updateCompany = (req, res) => {
    const id = req.params.id;
    const { company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id } = req.body;
  
    try {
      db.query(
        'UPDATE company_details SET company_name = ?, summary = ?, industry = ?, address = ?, poc1_name = ?, poc1_designation = ?, poc1_phone = ?, poc1_email = ?, poc2_name = ?, poc2_designation = ?, poc2_phone = ?, poc2_email = ?, company_username = ?, company_password = ?, role_id = ? WHERE id = ?',
        [company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id, id],
        (err, result) => {
          if (err) {
            console.error('Error updating company:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'company not found' });
          }
  
          return res.status(200).json({ success: "Company updated successfully" }); // Return success message
        }
      );
    } catch (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteCompany = (req, res) => {
    const id = req.params.id;

    try {
        db.query('DELETE FROM company_details WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting company:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'company not found' });
            }

            return res.status(200).json({ success: "company deleted successfully" }); // Return success message
        });
    } catch (error) {
        console.error('Error deleting company:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

