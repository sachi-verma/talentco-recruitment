const db = require('../Models/db');

exports.createModule = (req, res) => {
  const { module_id, module_name, module_url } = req.body;

  db.query(
    'INSERT INTO modules (module_id, module_name, module_url) VALUES (?, ?, ?)', [module_id, module_name, module_url],
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