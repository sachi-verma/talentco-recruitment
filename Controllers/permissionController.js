// to insert or update the values in the permissions database

const db = require('../Models/db');

exports.createPermission = (req, res) => {
  const { id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access } = req.body;

  db.query(
    'INSERT INTO permissions (id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE list_access = VALUES(list_access), view_access = VALUES(view_access), add_access = VALUES(add_access), edit_access = VALUES(edit_access), delete_access = VALUES(delete_access);',
    [id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log(results);
        res.status(200).json({ message: 'Permission created or updated successfully' });
      }
    }
  );
};
