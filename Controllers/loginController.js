const db = require('../Models/db');
const bcrypt = require('bcrypt');
const Users = require('../Models/userDetails');
const Permissions = require('../Models/permissions');
const Modules = require('../Models/modules');
const Roles = require('../Models/roles');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

Users.belongsTo(Roles, { foreignKey: 'role_id' });
Roles.hasMany(Users, { foreignKey: 'role_id' });

Permissions.belongsTo(Roles, { foreignKey: 'role_id' });
Roles.hasMany(Permissions, { foreignKey: 'role_id' });

Modules.hasMany(Permissions, { foreignKey: 'module_id' });
Permissions.belongsTo(Modules, { foreignKey: 'module_id' });

exports.loginAccess = async (req, res) => {
    const { username_login, password_login } = req.body;

    try {
        const user = await Users.findOne({
            where: { username_login },
            include: {
                model: Roles,
                include: {
                    model: Permissions,
                    include: Modules
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username' });
        }

        // // Check the password
        // const isPasswordValid = await bcrypt.compare(password_login, user.password_login);
        // if (!isPasswordValid) {
        //     return res.status(401).json({ error: 'Invalid password' });
        // }

        if (password_login !== user.password_login) {
            return res.status(401).json({ error: 'Invalid password' });
        }


        const { id, role_id, name } = user;

        
        // const token = jwt.sign({ name: user.name, role: user.role_id }, jwtSecretKey, { expiresIn: '24h' });

        // Extract necessary details
        

        const permissions = await Permissions.findAll({
            where: { role_id: role_id},
            include: [
                {model: Roles, attributes: ['role_name']},
                {model: Modules, attributes: ['module_name', 'module_url']}
            ]
        });

        if (permissions.length === 0) {
            return res.status(403).json({error: 'This user has no access for any page'});
        }

        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            time: Date(),
            userId: id,
            usersName: name,
            userRole: role_id
        }
 
        const token = jwt.sign(data, jwtSecretKey);

        // Return the user details and permissions
        res.json({
            name,
            token,
            permissions
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.verifyAccess = async (req, res) => {
    try {
        let token = req.headers.token;
        let jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

        // const tokenheader = header(token);
        const verified = jwt.verify(token, jwtSecretKey);

        // if (verified) {
        //     return res.send("Successfully Verified");
        // } else {
        //     // Access Denied
        //     return res.status(401).send(error).json({
        //         login: false,
        //         data: "error",
        //     });
        // }

        if (!verified) {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        console.log('Decoded Token:', verified);

        // const authHeader = token.split(' ')[1];

        const { userRole } = verified;
        console.log('Decoded Role:', userRole);

        // Fetch permissions based on the role
        const permissions = await Permissions.findAll({
            where: { role_id: userRole },
            include: [
                { model: Modules, attributes: ['module_name', 'module_url'] },
                { model: Roles, attributes: ['role_name'] }
            ],
            // attributes: ['view_access', 'delete_access']
        });

        return res.json({
            message: "Successfully Verified",
            permissions
        });

    } catch(error){
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}