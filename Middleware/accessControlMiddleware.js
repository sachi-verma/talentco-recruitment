// const Role = require('../Models/roles');
// const Module = require('../Models/modules');
// const Permission = require('../Models/permissions');
// db = require('../Models/db')

// const roleModel = new Role(db); // Pass your database connection
// const moduleModel = new Module(db); // Pass your database connection
// const permissionModel = new Permission(db); // Pass your database connection

// const checkPermission = async (req, res, next) => {
//   // Extract user role from req.user or wherever it is stored
//   const userRoleId = req.user.role_id; // Assuming you have a user object stored in req.user

//   // Extract requested module from req.params or req.body or wherever it is available
//   const moduleId = req.params.module_id; // Assuming the module_id is part of the request parameters

//   // Get user's role from the database
//   const userRole = await roleModel.getRoleById(userRoleId);

//   if (!userRole) {
//     return res.status(403).json({ error: "Forbidden" });
//   }

//   // Get module from the database
//   const module = await moduleModel.getModuleById(moduleId);

//   if (!module) {
//     return res.status(404).json({ error: "Module not found" });
//   }

//   // Get permissions for the user's role and the requested module from the database
//   const permission = await permissionModel.getPermissionsByRoleAndModule(userRoleId, moduleId);

//   if (!permission) {
//     return res.status(403).json({ error: "Unauthorized" });
//   }

//   // Check if the user has the required access
//   if (!permission.list_access) {
//     return res.status(403).json({ error: "Forbidden" });
//   }

//   next();
// };

// module.exports = checkPermission;