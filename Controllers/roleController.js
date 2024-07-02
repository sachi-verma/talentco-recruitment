const db = require('../Models/db');
const Roles = require('../Models/roles')


exports.createRole = async (req, res) => {
    try {
      const { id, role_name } = req.body;
      const role = await Roles.create({ id, role_name });
      res.status(200).json({ message: 'Role created successfully', role });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.getRole = async (req, res) => {
    try {
        const roles = await Roles.findAll({  order: [
          ['role_name', 'ASC'],
      ],}); 
        res.status(200).json(roles); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getRoleById = async (req, res) => {
    try {
        const id = req.params.id;
        const role = await Roles.findByPk(id); 
        res.status(200).json(role); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

exports.updateRole = async (req, res) => {
    try {
        const id = req.params.id;
        const { role_name } = req.body;
        const role = await Roles.update(req.body, {where: {id: id}});
  
          if (role[0] === 0) {
            return res.status(404).json({ error: 'Role not found' });
          }
  
          return res.status(200).json({ success: "role updated sucessfully", role: {id, role_name} }); 

    } catch (error) {
      console.error('Error updating role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteRole = async (req, res) => {
    try {
        const id = req.params.id;
        const role = Roles.destroy({where: {id: id}})
            if (role[0] === 0) {
                return res.status(404).json({ error: 'Role not found' });
            }
            return res.status(200).json({ success: "Role deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};