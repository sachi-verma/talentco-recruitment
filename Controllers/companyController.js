const db = require('../Models/db');
const Companys = require('../Models/companyDetails')

exports.registerCompany = async (req, res) => {
    try {
        const { id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id, recruiter_id } = req.body;
        const created_at= new Date();
        const company = await Companys.create({ id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id, created_by:recruiter_id, created_at:created_at });
        res.status(200).json({ message: 'company created successfully', company });
      } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getCompany = async (req,res) => {
    try {
        const company = await Companys.findAll(); 
        res.status(200).json(company); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getCompanyById = async (req, res) => {
    try {
        const id = req.params.id;
        const company = await Companys.findByPk(id); 
        res.status(200).json(company); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const { company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id } = req.body;
        const company = await Companys.update(req.body, {where: {id: id}});
  
          if (company[0] === 0) {
            return res.status(404).json({ error: 'company not found' });
          }
  
          return res.status(200).json({ success: "company updated sucessfully", company: {id, company_name, summary, industry, address, poc1_name, poc1_designation, poc1_phone, poc1_email, poc2_name, poc2_designation, poc2_phone, poc2_email, company_username, company_password, role_id} }); 

    } catch (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteCompany = (req, res) => {
    try {
        const id = req.params.id;
        const company = Companys.destroy({where: {id: id}})
            if (company[0] === 0) {
                return res.status(404).json({ error: 'company not found' });
            }
            return res.status(200).json({ success: "company deleted successfully" }); 
        
    } catch (error) {
        console.error('Error deleting company:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

