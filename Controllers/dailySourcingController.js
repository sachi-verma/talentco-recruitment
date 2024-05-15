const db = require('../Models/db');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');

exports.createSourcingReport = async (req, res) => {
    try {
        const { id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date } = req.body;
        const report = await Report.bulkCreate({ id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date });
        res.status(200).json({ message: 'Report created successfully', report });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getFilteredUpdate = async (req, res) => {
    try {
        const allReports = await Report.findAll();

        let alldata = [];
        let filterArr = [];
        let dates = [];

        allReports.forEach((report) => {
            dates.push(report.sourcing_date);
        });

        const uniqueDates = [...new Set(dates)];

        uniqueDates.forEach((date) => {
            filterArr.push(allReports.filter((report) => report.sourcing_date === date));
        });

        filterArr.forEach((filteredReports) => {
            let totalCv = filteredReports.length;
            let totalRelevant = filteredReports.filter((report) => report.relevant === "Yes").length;
            let pending = filteredReports.filter((report) => report.candidate_status === "confirmation pending").length;
            let sent = filteredReports.filter((report) => report.candidate_status === "sent to client").length;

            alldata.push({

                date: filteredReports[0].sourcing_date,
                totalCv,
                totalRelevant,
                pending,
                sent
            });
        });

        res.status(200).json({
            data: {
                alldata,
                filterArr
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
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
