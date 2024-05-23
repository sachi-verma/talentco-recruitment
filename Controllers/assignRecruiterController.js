const db = require('../Models/db');
const Positions = require('../Models/allPositions');
const Users = require('../Models/userDetails');

exports.getRecruiter = async (req,res) => {
  try {
      const users = await Users.findAll({where : {role_id: '17',},}); 
      res.status(200).json(users); 
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('500 server error');
  }
}

exports.assignRecruiter = async (req, res) => {
    try {
        const id = req.params.id;
        const { recruiter_assign } = req.body;
        await Positions.update({ recruiter_assign }, {where: {id: id}});
  
        return res.status(200).json({ success: "recruiter assigned sucessfully", recruiter: {id, recruiter_assign} }); 

    } catch (error) {
      console.error('Error assigning recruiter:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };