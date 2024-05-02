const db = require('../Models/db');

exports.createRole = (req, res) => {
  const { id, role_name } = req.body;

  db.query(
    'INSERT INTO roles (id, role_name) VALUES (?,?)',
    [id, role_name],
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
};

exports.getRole = (req,res) => {
    db.query('SELECT * FROM roles', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
});
}

exports.getRoleById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM roles WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving role:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Role not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.updateRole = (req, res) => {
    const id = req.params.id;
    const { role_name } = req.body;
  
    try {
      db.query(
        'UPDATE roles SET role_name = ? WHERE id = ?',
        [role_name, id],
        (err, result) => {
          if (err) {
            console.error('Error updating role:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Role not found' });
          }
  
          return res.status(200).json({ success: "role updated sucessfully" }); // Return success message
        }
      );
    } catch (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteRole = (req, res) => {
    const id = req.params.id;

    try {
        db.query('DELETE FROM roles WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting role:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Role not found' });
            }

            return res.status(200).json({ success: "Role deleted successfully" }); // Return success message
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};