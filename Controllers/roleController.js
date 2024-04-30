const db = require('../Models/db');

exports.createRole = (req, res) => {
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