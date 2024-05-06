const db = require('../Models/db');

exports.createJob = (req, res) => {
  const { id, company_id, position, location, experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification } = req.body;
//   const jd_upload = req.file ? req.file.path : null;

  db.query(
    'INSERT INTO job_details (id, company_id, position, location, experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, company_id, position, location, experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(results);
        res.status(200).json({ message: 'Job created successfully' });
      }
    }
  );
};

exports.getJob = (req,res) => {
    db.query('SELECT * FROM job_details', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
});
}

exports.getJobById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM job_details WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving job:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Job not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.updateJob = (req, res) => {
    const id = req.params.id;
    const { company_id, position, location, experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, upload_date } = req.body;
  
    try {
      db.query(
        'UPDATE job_details SET company_id = ?, position = ?, location = ?, experience = ?, min_ctc = ?, max_ctc = ?, no_of_positions = ?, gender_pref = ?, qualification = ?, upload_date = ? WHERE id = ?',
        [company_id, position, location, experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, upload_date, id],
        (err, result) => {
          if (err) {
            console.error('Error updating job:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'job not found' });
          }
  
          return res.status(200).json({ success: "job updated sucessfully" }); // Return success message
        }
      );
    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteJob = (req, res) => {
    const id = req.params.id;

    try {
        db.query('DELETE FROM job_details WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting job:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'job not found' });
            }

            return res.status(200).json({ success: "job deleted successfully" }); // Return success message
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};