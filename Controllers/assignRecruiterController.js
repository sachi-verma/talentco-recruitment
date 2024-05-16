const db = require('../Models/db');
const Jobs = require('../Models/jobDetails')
const Positions = require('../Models/allPositions')

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