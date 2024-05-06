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

exports.getPermission = (req,res) => {
    db.query('SELECT * FROM permissions', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
});
}

exports.getPermissionById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM permissions WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving permission:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Permission not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};

exports.getPermissionDetails = (req,res) => {
    db.query('SELECT permissions.id, permissions.role_id, permissions.module_id, permissions.list_access, permissions.view_access, permissions.add_access, permissions.edit_access, permissions.delete_access, modules.module_name, modules.module_url FROM permissions INNER JOIN modules ON permissions.module_id = modules.id', (err, results) => {
        if (err) {
          console.error('Error is:', err);
          res.status(500).send('500 server error');
        } else {
          res.json(results);
        }
});
}

exports.getPermissionDetailsById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT permissions.id, permissions.role_id, permissions.module_id, permissions.list_access, permissions.view_access, permissions.add_access, permissions.edit_access, permissions.delete_access, modules.module_name, modules.module_url FROM permissions INNER JOIN modules ON permissions.module_id = modules.id WHERE permissions.id = ?;', [id], (err, results) => {
        if (err) {
            console.error('Error retrieving permission:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Permission not found' });
            } else {
                res.json(results[0]);
            }
        }
    });
};
