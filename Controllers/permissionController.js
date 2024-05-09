// to insert or update the values in the permissions database

const db = require('../Models/db');
const Permissions = require('../Models/permissions');
const Modules = require('../Models/modules');


exports.createPermission = async (req, res) => {
    try {
        const { id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access } = req.body;
        const permission = await Permissions.create({ id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access });
        res.status(200).json({ message: 'permission created successfully', permission });
      } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getPermission = async (req,res) => {
    try {
        const permission = await Permissions.findAll(); 
        res.status(200).json(permission); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getPermissionById = async (req, res) => {
    try {
        const id = req.params.id;
        const permission = await Permissions.findByPk(id); 
        res.status(200).json(permission); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};


// exports.getPermissionDetails = async (req, res) => {
//     try {
//         const permissions = await Permissions.findAll({
//           include: [{
//             association: 'modules',
//             required: true,
//           }],
//         });
//         res.status(200).json(permissions);
//       } catch (error) {
//         console.error("Error fetching permissions details:", error);
//         res.status(500).send('500 server error');
//       }
// };


// exports.getPermissionDetailsById = (req, res) => {
//     const id = req.params.id;
//     db.query('SELECT permissions.id, permissions.role_id, permissions.module_id, permissions.list_access, permissions.view_access, permissions.add_access, permissions.edit_access, permissions.delete_access, modules.module_name, modules.module_url FROM permissions INNER JOIN modules ON permissions.module_id = modules.id WHERE permissions.id = ?;', [id], (err, results) => {
//         if (err) {
//             console.error('Error retrieving permission:', err);
//             res.status(500).json({ error: 'Internal server error' });
//         } else {
//             if (results.length === 0) {
//                 res.status(404).json({ error: 'Permission not found' });
//             } else {
//                 res.json(results[0]);
//             }
//         }
//     });
// };

exports.updatePermission = async (req, res) => {
    try {
        const id = req.params.id;
        const { role_id, module_id, list_access, view_access, add_access, edit_access, delete_access } = req.body;
        const permission = await Permissions.update(req.body, {where: {id: id}});
  
          if (permission[0] === 0) {
            return res.status(404).json({ error: 'permission not found' });
          }
  
          return res.status(200).json({ success: "permission updated sucessfully", permission: {id, role_id, module_id, list_access, view_access, add_access, edit_access, delete_access} }); 

    } catch (error) {
      console.error('Error updating permission:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deletePermission = (req, res) => {
    try {
        const id = req.params.id;
        const permission = Permissions.destroy({where: {id: id}})
            if (permission[0] === 0) {
                return res.status(404).json({ error: 'permission not found' });
            }
            return res.status(200).json({ success: "permission deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting permission:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};