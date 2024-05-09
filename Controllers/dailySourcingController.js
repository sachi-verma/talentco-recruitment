const db = require('../Models/db');
const Report = require('../Models/dailySourcingReport');
const Update = require('../Models/dailySourcingUpdate');

exports.createSourcingReport = async (req, res) => {
    try {
        const { id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date } = req.body;
        const report = await Report.create({ id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date });
        res.status(200).json({ message: 'Report created successfully', report });
      } catch (error) {
        console.error('Error creating Report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};

exports.getFilteredUpdate = async (req, res) => {
    try {
        // get all source data
        const getdata = await Report.findAll();
        // below array is for store all source data calculations and show by date
        let alldata = [];
        //below array is for store all sourced data separate by date
        let filterArr = [];
        //blelow array for store all dates
        const temp = [];
        // get all dates
        getdata?.forEach((val) => {
            temp.push(val.date);
        })
        //get unique dates
        const unique = [...new Set(temp)];
        //length of total unique dates
        let totalUnique = unique?.length;
        // create empty array for each unique date
        let n = 0;
        while (n < totalUnique) {
            filterArr?.push([]);
            n++;
        }
        //add data into array by date
        n = 0;
        while (n < totalUnique) {
            getdata?.forEach((val) => {
                if (val.date === unique[n]) {
                    filterArr[n].push(val);
                }
            })
            n++;
        }

        n = 0;
        let totalcv;
        let totalRelevant;
        let pending;
        let sent;
        while (n < totalUnique) {
            // total cv
            totalcv = filterArr[n]?.length;
            //total relevant
            totalRelevant = filterArr[n]?.filter((val) => {
                if (val?.relevant === "Yes") {
                    return val;
                }
            });
            totalRelevant = totalRelevant?.length;
            // total pending
            pending = filterArr[n]?.filter((val) => {
                if (val?.candidateStatus === "confirmation pending") {
                    return val;
                }
            });
            pending = pending?.length;
            // total sent cv's
            sent = filterArr[n]?.filter((val) => {
                if (val?.candidateStatus === "sent to client") {
                    return val;
                }
            });
            sent = sent?.length;
            // add calculations to unique date
            if (alldata?.length >= 1) {
                alldata = [...alldata,
                {
                    id: alldata?.length + 1,
                    date: unique[n],
                    totalCv: totalcv,
                    totalRelevant: totalRelevant,
                    pending: pending,
                    sent: sent
                },
                ]
            }
            else {
                alldata = [
                    {
                        id: 1,
                        date: unique[n],
                        totalCv: totalcv,
                        totalRelevant: totalRelevant,
                        pending: pending,
                        sent: sent
                    },
                ]
            }
            n++;
        }
        res.status(200).json({ data: { alldata: alldata, filterArr: filterArr } });
    } catch (error) {
        res.status(400).send(error);
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
