const db = require('../Models/db');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');

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

async function FilteredUpdate() {
    try {
        const allReports = await Report.findAll();

        let alldata = [];
        let filterArr = [];
        let dates = [];

        allReports.forEach((report) => {
            dates.push(report.sourcing_date);
        });

        const uniqueDates = [...new Set(dates)];

        uniqueDates.forEach(async (update_date) => {
            const filteredReports = allReports.filter((report) => report.sourcing_date === update_date);

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
        
        const createdReports = await Report.bulkCreate(reportsData);

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

exports.getSourcingReport = async (req, res) => {
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