const db = require('../Models/db');

exports.createModule = (req, res) => {
  const { id, module_name, module_url } = req.body;

  db.query(
    'INSERT INTO modules (id, module_name, module_url) VALUES (?, ?, ?)', [id, module_name, module_url],
    (err, results) => {
      if (err) {
        console.error('Error is: ', err)
        res.status(500).send("Internal Server Error")
      } else {
        console.log(results)
        res.status(200).json({ message: 'Module Created Successfully' })
      }
    }
  );
};

exports.getModule = (req, res) => {
    db.query('SELECT * FROM modules', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
      });
}

exports.getModuleById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM modules WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving module:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Module not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.updateModule = (req, res) => {
    const id = req.params.id;
    const { module_name, module_url } = req.body;
  
    try {
      db.query(
        'UPDATE modules SET module_name = ?, module_url = ? WHERE id = ?',
        [module_name, module_url, id],
        (err, result) => {
          if (err) {
            console.error('Error updating module:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'module not found' });
          }
  
          return res.status(200).json({ success: "Module updated sucessfully" }); // Return success message
        }
      );
    } catch (error) {
      console.error('Error updating module:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteModule = (req, res) => {
    const id = req.params.id;

    try {
        db.query('DELETE FROM modules WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting module:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'module not found' });
            }

            return res.status(200).json({ success: "module deleted successfully" }); // Return success message
        });
    } catch (error) {
        console.error('Error deleting module:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};