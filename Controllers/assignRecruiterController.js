const db = require('../Models/db');
const Positions = require('../Models/allPositions');
const Users = require('../Models/userDetails');
const assignRecruiter = require('../Models/assignRecruiter');
const Roles = require('../Models/roles');
const {Op}= require("sequelize");
const Company = require('../Models/companyDetails');
const { sendMail } = require("../Controllers/emailController");
const assignRecruiterLogs = require('../Models/assignRecruiterLogs');

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
      }},order:[['name', 'ASC']] }); 
      res.status(200).json(users); 
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('500 server error');
  }
}

exports.assignRecruiter = async (req, res) => {
    try {
        const position_id = req.params.id;
        const { recruiter_id, user_id, current_date } = req.body;
        //await Positions.update({ recruiter_assign }, {where: {id: position_id}});
        let assigned = 1;
        let errorinmail =false;
        // let date = new Date();
        // let created_at = date.toISOString().split('T')[0];
        let created_at =  current_date;
        let assigned_at = current_date.split('T')[0];

        
        let position = await Positions.findOne({
          include: [
            {
              model: Company,
              required: true,
              attributes: ["company_name"],
            },
          ],
          where:{id:position_id}});
        let recruiter = await Users.findOne({where:{id:recruiter_id}});

        if(position && recruiter){

         // console.log("=========>>>>>", position, '========>>>> recruiter', recruiter)

        const recruiterExist =await assignRecruiter.findOne({where: {position_id: position_id, recruiter_id: recruiter_id}});

        if(recruiterExist){
          return res.status(404).json({error:"This recruiter already assigned for this position", position_id: position_id, recruiter_id:recruiter_id});
        }
        else{
          await assignRecruiter.create({position_id, recruiter_id, created_at:assigned_at, created_by:user_id});
          await Positions.update({recruiter_assign:assigned }, {where:{id:position_id}});

          await assignRecruiterLogs.create({position_id, recruiter_id, created_at, created_by:user_id, active:1,assigned_at});

          let recruitername = recruiter.name;
          let recruiteremail = recruiter.email;
          let positionname = position.position;
          let companyname = position.Company.company_name;

         // console.log(positionname, companyname, recruitername, recruiteremail);
          if(recruiteremail){
          try {
            await sendMail({
              to: recruiteremail,
              subject: `Assigned to a New Position || ${positionname} at ${companyname} !!`,
              text: `Dear, ${recruitername}!
You have been assigned to a new position for company ${companyname}. You can find the Position Details below, 
               
Position Name: ${positionname},
Company Name: ${companyname},
Number of Positions : ${position.no_of_positions},
Location : ${position.location},
Experience : ${position.min_experience} to ${position.max_experience},
Min CTC : ${position.min_ctc},
Max CTC : ${position.max_ctc},
Qualification : ${position.qualification},
Gender Preferences : ${position.gender_pref},

Regards,
Talent Co Hr Services`,
            });
          } catch (mailError) {
            errorinmail=true;
            console.error("Error sending notification email:", mailError);
           
            //return res.status(500).json({ error: 'Failed to send notification email' });
          }
        }


        }
        return res.status(200).json({ success: `Recruiter Assigned Successfully !! ${errorinmail?"Error in Sending Mail !!":"Mail sent Successfully!"} `, recruiter: {position_id, recruiter_id} }); 
      } else{

        return res.status(404).json({error: "Position Or Recruiter Not Found !!", recruiter_id, position_id});
      }
    } catch (error) {
      console.error('Error assigning recruiter:', error);
      return res.status(500).json({ error: 'Internal server error', msg: error.message });
    }
  };

  exports.deleteAssignRecruiter = async (req, res) => {
    try {
      const position_id = req.params.id;
      const { recruiter_id, user_id, current_date } = req.body;
      let notassigned = 0;
      // let date = new Date();
      // let removed_at = date.toISOString().split('T')[0];
      let removed_at = current_date.split('T')[0];
      let updated_at= current_date;

  
      await assignRecruiter.destroy(
        {where: { position_id, recruiter_id }}
      );
      await assignRecruiterLogs.update({removed_at, removed_by:user_id, active:0, updated_at}, {where: {position_id, recruiter_id, removed_at:null, removed_by:null}});

      let recruiterassigned = await assignRecruiter.findOne({ where:{ position_id}});

      if(!recruiterassigned){
        await Positions.update({recruiter_assign:notassigned }, {where:{id:position_id}});
      }
  
      res.status(200).json({ success: "Recruiter Removed Successfully !!", recruiter_id, position_id});
    } catch (error) {
      console.error('Error deleting assigned recruiter:', error);
      return res.status(500).json({ error: 'Internal server error', msg: error.message });
    }
  };
  