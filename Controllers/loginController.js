const db = require('../Models/db');
const bcrypt = require('bcrypt');
const Users = require('../Models/userDetails');
const Permissions = require('../Models/permissions');
const Modules = require('../Models/modules');
const Roles = require('../Models/roles');

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

        // Extract necessary details
        const { role_id, name } = user;
        // const permissions = user.Roles.map(role => role.Permissions.map(permission => ({
        //     permission_id: permission.permission_id,
        //     module_id: permission.module_id,
        //     module_name: permission.Module.module_name,
        //     list_access: permission.list_access,
        //     view_access: permission.view_access,
        //     add_access: permission.add_access,
        //     edit_access: permission.edit_access,
        //     delete_access: permission.delete_access
        // }))).flat();
        let permissions = [];
        console.log(user.Roles);
        if (user.Roles && Array.isArray(user.Roles)) {
            permissions = user.Roles.flatMap(role => role.Permissions || []);
            permissions = permissions.map(permission => ({
                permission_id: permission.permission_id,
                module_id: permission.module_id,
                module_name: permission.Module ? permission.Module.module_name : null,
                list_access: permission.list_access,
                view_access: permission.view_access,
                add_access: permission.add_access,
                edit_access: permission.edit_access,
                delete_access: permission.delete_access
            }));
        }

        // Return the user details and permissions
        res.json({
            role_id,
            name,
            permissions
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}