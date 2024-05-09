const db = require('../Models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.getAuth = (req, res) => {
    const { username_login, password_login } = req.body;
  
    // Check if username exists
    db.query('SELECT * FROM user_details WHERE username_login = ?', [username_login], (error, results) => {
    // console.log(results);
      if (error) {
        res.status(500).json({ error: 'Internal server error' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        const user = results[0];

        // Compare passwords
        // bcrypt.compare(password_login, user.password_login, (err, isMatch) => {
        //     console.log(password_login)
        //     console.log(user.password_login)
        //   if (err) {
        //     res.status(500).json({ error: 'Internal server error' });
        //   } else if (!isMatch) {
        //     res.status(401).json({ error: 'Incorrect password' });
        if (password_login !== user.password_login) {
            res.status(401).json({ error: 'Incorrect password' });
          } else {
            // Passwords match, generate JWT token
            const payload = {
              username_login: user.username_login,
              role_id: user.role_id
            };
            const token = jwt.sign(payload, 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJUYWxlbnRjbyIsIlVzZXJuYW1lIjoiUmVjcnVpdG1lbnQiLCJleHAiOjE3MTQ5OTQxNTksImlhdCI6MTcxNDk5NDE1OX0.yyq-wrXwrQBtjjXz5ZInkS-CnWPUECrR6jcFPr5XYJk', { expiresIn: '1h' });
            res.json({ token });
          }
        // });
      }
    });
  };
  
  // Middleware to verify JWT token
  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    jwt.verify(token, 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJUYWxlbnRjbyIsIlVzZXJuYW1lIjoiUmVjcnVpdG1lbnQiLCJleHAiOjE3MTQ5OTQxNTksImlhdCI6MTcxNDk5NDE1OX0.yyq-wrXwrQBtjjXz5ZInkS-CnWPUECrR6jcFPr5XYJk', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = decoded;
      next();
    });
  };
  
  // Protected route to get user permissions
//   exports.getPermission(verifyToken) = (req, res) => {
//     const { role_id } = req.user;
//     // Query permissions based on user's role
//     db.query('SELECT permissions.id, permissions.role_id, permissions.module_id, permissions.list_access, permissions.view_access, permissions.add_access, permissions.edit_access, permissions.delete_access, modules.module_name, modules.module_url FROM permissions INNER JOIN modules ON permissions.module_id = modules.id WHERE permissions.role_id = ?;', [role_id], (error, results) => {
//       if (error) {
//         res.status(500).json({ error: 'Internal server error' });
//       } else {
//         res.json(results);
//       }
//     });
//   };