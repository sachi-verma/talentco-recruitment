const db = require('../Models/db');
const Positions = require('../Models/allPositions');
const Users = require('../Models/userDetails');
const assignRecruiter = require('../Models/assignRecruiter');
const Roles = require('../Models/roles');
const {Op}= require("sequelize");
const Company = require('../Models/companyDetails');
const { sendMail } = require("../Controllers/emailController");

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
        let errorinmail =false;
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

          console.log("=========>>>>>", position, '========>>>> recruiter', recruiter)

        const recruiterExist =await assignRecruiter.findOne({where: {position_id: position_id, recruiter_id: recruiter_id}});

        if(recruiterExist){
          return res.status(404).json({error:"This recruiter already assigned for this position", position_id: position_id, recruiter_id:recruiter_id});
        }
        else{
          await assignRecruiter.create({position_id, recruiter_id });
          await Positions.update({recruiter_assign:assigned }, {where:{id:position_id}});

          let recruitername = recruiter.name;
          let recruiteremail = recruiter.email;
          let positionname = position.position;
          let companyname = position.Company.company_name;

          console.log(positionname, companyname, recruitername, recruiteremail);
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
               Experience : ${position.experience},
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