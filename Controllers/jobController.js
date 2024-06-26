const db = require('../Models/db');
const Jobs = require('../Models/jobDetails');
const Positions = require('../Models/allPositions');
const Company = require('../Models/companyDetails');

Company.hasMany(Positions, { foreignKey: 'company_id' });
Positions.belongsTo(Company, { foreignKey: 'company_id' });

exports.createJob = async (req, res) => {
    try {
        const { id, company_id, position, location, min_experience, max_experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, upload_date, recruiter_id } = req.body;
        const jd_upload = req.file ? req.file.path : null;
        const created_at = new Date();
        const position_status ="Open";
        const jobs = await Positions.create({ id, company_id, position, location, min_experience, max_experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, upload_date, jd_upload, position_status, created_at, created_by:recruiter_id });
        res.status(200).json({ message: 'jobs created successfully', jobs });
      } catch (error) {
        console.error('Error creating jobs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getJob = async (req,res) => {
    try {
        const job = await Positions.findAll({
            include: [{
                model: Company,
                required: true
            }]
        }); 
        res.status(200).json(job); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await Positions.findByPk(id); 
        res.status(200).json(job); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

exports.updateJob = async (req, res) => {
    try {
        const id = req.params.id;
        const { company_id, position, location, min_experience, max_experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, recruiter_id } = req.body;
        
        const jd_upload = req.file ? req.file.path : null;

        let updateData = {};
         if(company_id !== undefined){
            updateData.company_id = company_id;
         }
         if(position !== undefined){
            updateData.position = position;
         }
         if(location !== undefined){
            updateData.location = location;
         }
         if(min_experience !== undefined){
            updateData.min_experience = min_experience;
         }
         if(max_experience !== undefined){
            updateData.max_experience = max_experience;
         }
         if(min_ctc !== undefined){
            updateData.min_ctc = min_ctc;
         }
         if(max_ctc !== undefined){
            updateData.max_ctc = max_ctc;
         }
         if(no_of_positions !== undefined){
            updateData.no_of_positions = no_of_positions;
         }
         if(gender_pref !== undefined){
            updateData.gender_pref = gender_pref;
         }
         if(qualification !== undefined){
            updateData.qualification = qualification;
         }

         if(recruiter_id !== undefined){
            updateData.updated_by = recruiter_id;
            updateData.updated_at = new Date();
         }


         // Only add jd_upload to updateData if a file was uploaded
         if (jd_upload) {
             updateData.jd_upload = jd_upload;
         }
 
         const job = await Positions.update(updateData, { where: { id: id } });

          if (job[0] === 0) {
            return res.status(404).json({ error: 'job not found' });
          }
  
          return res.status(200).json({ success: "job updated sucessfully", job: {id, company_id, position, location, min_experience, max_experience, min_ctc, max_ctc, no_of_positions, gender_pref, qualification, jd_upload} }); 

    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteJob = (req, res) => {
    try {
        const id = req.params.id;
        const job = Positions.destroy({where: {id: id}})
            if (job[0] === 0) {
                return res.status(404).json({ error: 'job not found' });
            }
            return res.status(200).json({ success: "job deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};