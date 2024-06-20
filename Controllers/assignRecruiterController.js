const db = require('../Models/db');
const Positions = require('../Models/allPositions');
const Users = require('../Models/userDetails');
const assignRecruiter = require('../Models/assignRecruiter');
const Roles = require('../Models/roles');
const {Op}= require("sequelize");

// exports.getRecruiter = async (req,res) => {
//   try {
//       const users = await Users.findAll({where : {role_id: '17'},}); 
//       res.status(200).json(users); 
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('500 server error');
//   }
//}
exports.getRecruiter = async (req,res) => {
  try {
    const role = await Roles.findAll({where:{
      role_name :{
        [Op.or]: ["Team Lead", "Recruiter"]
      }
    }})
     const teamlead = role[0].id;

      const users = await Users.findAll({where :{ role_id:{
        [Op.or]: [role[0].id,role[1].id]
      }}}); 
      res.status(200).json(users); 
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('500 server error');
  }
}

exports.assignRecruiter = async (req, res) => {
    try {
        const position_id = req.params.id;
        const { recruiter_id } = req.body;
        //await Positions.update({ recruiter_assign }, {where: {id: position_id}});
        let assigned = 1;
        const recruiterExist =await assignRecruiter.findOne({where: {position_id: position_id, recruiter_id: recruiter_id}});

        if(recruiterExist){
          return res.status(404).json({error:"This recruiter already assigned for this position", position_id: position_id, recruiter_id:recruiter_id});
        }
        else{
          await assignRecruiter.create({position_id, recruiter_id });
          await Positions.update({recruiter_assign:assigned }, {where:{id:position_id}});
        }
        
  
        return res.status(200).json({ success: "recruiter assigned sucessfully", recruiter: {position_id, recruiter_id} }); 

    } catch (error) {
      console.error('Error assigning recruiter:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };