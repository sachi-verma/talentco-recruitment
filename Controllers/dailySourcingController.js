const db = require('../Models/db');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');

Position.hasMany(Candidate, { foreignKey: 'position' });
Candidate.belongsTo(Position, { foreignKey: 'position' });

Company.hasMany(Position, { foreignKey: 'company_id' });
Position.belongsTo(Company, { foreignKey: 'company_id' });

exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.json(companies);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getPositionsOfCompany = async (req,res) => {
    const companyId = req.params.companyId;
    try {
        const positions = await Position.findAll({ where: { company_id: companyId } });
        res.json(positions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//USING THE daily_sourcing_report DATABASE
exports.createSourcingReport = async (req, res) => {
    try {
        const { id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date } = req.body;

        const report = await Report.create({ id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date });

        const alldata = await FilteredUpdate();

        res.status(200).json({ message: 'Report created successfully', report, alldata });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

//USING THE all_candidates DATABASE
exports.addSourcingReport = async (req, res) => {
    try {
        const { id, candidate, position, cv_sourced_from, relevant, candidate_status, remarks, created_at } = req.body;

        // Define the required fields for validation
        const requiredFields = ['candidate', 'company', 'position', 'location', 'min_ctc', 'max_ctc', 'cv_sourced_from', 'relevant', 'candidate_status'];

        // Validate the request body
        for (let field of requiredFields) {
            if (!req.body.hasOwnProperty(field) || req.body[field] === null || req.body[field] === '') {
                console.error(`Missing or empty field: ${field} in report:`, req.body);
                return res.status(400).json({ error: `Missing or empty fields detected` });
            }
        }


        const report = await Candidate.create({ id, candidate, position, cv_sourced_from, relevant, candidate_status, remarks, created_at });

        const alldata = await FilteredUpdate();

        res.status(200).json({ message: 'Report created successfully', report, alldata });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

async function FilteredUpdate() {
    try {
        const allReports = await Candidate.findAll();

        let alldata = [];
        let filterArr = [];
        let dates = [];

        allReports.forEach((report) => {
            dates.push(report.created_at);
        });

        const uniqueDates = [...new Set(dates)];

        uniqueDates.forEach(async (update_date) => {
            const filteredReports = allReports.filter((report) => report.created_at === update_date);

            let total_cv_sourced = filteredReports.length;
            let total_cv_relevant = filteredReports.filter((report) => report.relevant === "Yes").length;
            let total_confirmation_pending = filteredReports.filter((report) => report.candidate_status === "confirmation pending").length;
            let total_sent_to_client = filteredReports.filter((report) => report.candidate_status === "sent to client").length;

            // Find or create the entry based on the update_date
            const [update, created] = await Update.findOrCreate({
                where: { update_date },
                defaults: {
                    total_cv_sourced,
                    total_cv_relevant,
                    total_confirmation_pending,
                    total_sent_to_client
                }
            });

            // If the entry already existed, update its values
            if (!created) {
                await update.update({
                    total_cv_sourced,
                    total_cv_relevant,
                    total_confirmation_pending,
                    total_sent_to_client
                });
            }

            alldata.push({
                update_date,
                total_cv_sourced,
                total_cv_relevant,
                total_confirmation_pending,
                total_sent_to_client
            });
        });

        return alldata;
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

exports.createBulkSourcingReport = async (req, res) => {
    try {
        const reportsData = req.body; // Assuming the frontend sends an array of report objects
        console.log("=====>>>>>")
        if (!Array.isArray(reportsData) || reportsData.length === 0) {
            console.error('No reports data provided');
            return res.status(400).json({ error: 'No reports data provided' });
        }

        // Define the required fields for validation
        const requiredFields = ['candidate', 'company', 'position', 'location', 'min_ctc', 'max_ctc', 'cv_sourced_from', 'relevant', 'candidate_status'];

        // Validate each report object
        for (let report of reportsData) {
            for (let field of requiredFields) {
                if (!report.hasOwnProperty(field) || report[field] === null || report[field] === '') {
                    console.error(`Missing or empty field: ${field} in report:`, report);
                    return res.status(400).json({ error: `Missing or empty fields detected` });
                }
            }
        }
        
        const createdReports = await Candidate.bulkCreate(reportsData);

        const alldata = await FilteredUpdate();

        if (!createdReports || createdReports.length === 0) {
            console.error('No reports created');
            return res.status(400).json({ error: 'No reports created' });
        }

        res.status(200).json({ message: 'Reports created successfully', reports: createdReports, alldata: alldata });
    } catch (error) {
        console.error('Error creating Reports:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//from all_candidates table
exports.getSourcingReport = async (req, res) => {
    try {
        const report = await Candidate.findAll({
            attributes: ['id', 'candidate', 'position', 'cv_sourced_from', 'relevant', 'candidate_status', 'remarks', 'created_at', 'updated_at'],
            include: [{ 
                model: Position,
                required: true,
                attributes: ['id', 'company_id', 'position', 'location', 'experience', 'min_ctc'],
                include: [{ 
                    model:Company,
                    required: true,
                    attributes: ['company_name']
                }]
            }]
        }); 
        res.status(200).json({message: 'candidate fetched successfully', Candidates: report}); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

//from daily_sourcing_report table
exports.getCandidateSourcing = async (req, res) => {
    try {
        const report = await Report.findAll(); 
        res.status(200).json(report); 
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.getFilteredUpdate = async (req, res) => {
    try{
        const update = await Update.findAll();
        res.status(200).json(update);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.statusChange = async (req, res) => {
    try {
        const id = req.params.id;
        const { candidate_status } = req.body;
        await Report.update({ candidate_status }, {where: {id: id}});
  
        return res.status(200).json({ success: "status changed sucessfully", candidate: {id, candidate_status} }); 

    } catch (error) {
      console.error('Error changing status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };