const db = require('../Models/db');
const Users = require('../Models/userDetails')

exports.createUser = async (req, res) => {
    try {
        const { id, name, designation, phone, email, role_id, username_login, password_login } = req.body;
        const user = await Users.create({ id, name, designation, phone, email, role_id, username_login, password_login });
        res.status(200).json({ message: 'user created successfully', user });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getUser = async (req,res) => {
    try {
        const users = await Users.findAll(); 
        res.status(200).json(users); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await Users.findByPk(id); 
        res.status(200).json(user); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, designation, phone, email, role_id, username_login, password_login } = req.body;
        const user = await Users.update(req.body, {where: {id: id}});
  
          if (user[0] === 0) {
            return res.status(404).json({ error: 'user not found' });
          }
  
          return res.status(200).json({ success: "user updated sucessfully", user: {id, name, designation, phone, email, role_id, username_login, password_login} }); 

    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteUser = (req, res) => {
    try {
        const id = req.params.id;
        const user = Users.destroy({where: {id: id}})
            if (user[0] === 0) {
                return res.status(404).json({ error: 'user not found' });
            }
            return res.status(200).json({ success: "user deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};