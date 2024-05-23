const db = require('../Models/db');
const User = require('../Models/userDetails');
const Permissions = require('../Models/permissions');
const Modules = require('../Models/modules');
const Roles = require('../Models/roles');

User.belongsTo(Roles, { foreignKey: 'role_id' });
Roles.hasMany(User, { foreignKey: 'role_id' });

Permissions.belongsTo(Roles, { foreignKey: 'role_id' });
Roles.hasMany(Permissions, { foreignKey: 'role_id' });

Modules.hasMany(Permissions, { foreignKey: 'module_id' });
Permissions.belongsTo(Modules, { foreignKey: 'module_id' });

exports.loginAccess = async (req, res) => {
    const { username_login, password_login } = req.body;

    try {
        const user = await User.findOne({
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
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(password_login, user.password_login);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Extract necessary details
        const { role_id, name } = user;
        const permissions = user.Roles.Permissions.map(permission => ({
            permission_id: permission.permission_id,
            module_id: permission.module_id,
            module_name: permission.Module.module_name,
            list_access: permission.list_access,
            view_access: permission.view_access,
            add_access: permission.add_access,
            edit_access: permission.edit_access,
            delete_access: permission.delete_access
        }));

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