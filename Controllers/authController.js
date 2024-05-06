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
              role: user.role
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
  
//   // Protected route to get user permissions
//   app.get('/permissions', verifyToken, (req, res) => {
//     const { role } = req.user;
//     // Query permissions based on user's role
//     connection.query('SELECT * FROM permissions WHERE role = ?', [role], (error, results) => {
//       if (error) {
//         res.status(500).json({ error: 'Internal server error' });
//       } else {
//         res.json(results);
//       }
//     });
//   });