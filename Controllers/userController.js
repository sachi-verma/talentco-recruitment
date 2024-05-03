const db = require('../Models/db');

exports.createUser = (req, res) => {
  const { id, name, designation, phone, email, role_id, username_login, password_login } = req.body;

  db.query(
    'INSERT INTO user_details (id, name, designation, phone, email, role_id, username_login, password_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, designation, phone, email, role_id, username_login, password_login],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(results);
        res.status(200).json({ message: 'User created successfully' });
      }
    }
  );
};

exports.getUser = (req,res) => {
    db.query('SELECT * FROM user_details', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
});
}

exports.getUserById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM user_details WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving role:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    const { name, designation, phone, email, role_id, username_login, password_login } = req.body;
  
    try {
      db.query(
        'UPDATE user_details SET name = ?, designation = ?, phone = ?, email = ?, role_id = ?, username_login = ?, password_login = ? WHERE id = ?',
        [name, designation, phone, email, role_id, username_login, password_login, id],
        (err, result) => {
          if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
  
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
  
          return res.status(200).json({ success: "user updated sucessfully" }); // Return success message
        }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteUser = (req, res) => {
    const id = req.params.id;

    try {
        db.query('DELETE FROM user_details WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting user:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({ success: "User deleted successfully" }); // Return success message
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};