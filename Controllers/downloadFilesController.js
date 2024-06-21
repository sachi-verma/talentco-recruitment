const path = require("path");
const fs = require("fs");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");
const Update = require('../Models/dailySourcingUpdate');
const assignRecruiter = require("../Models/assignRecruiter");


exports.exportResumes = async (req, res) => {
    try {
        const id = req.params.id;
        const candidate = await Candidate.findOne({ where: { id: id } });

        if (candidate) {
            let resumepath = candidate.candidate_resume;

            if (!resumepath) {
                return res.status(404).json({ error: "No resume found !!" });
            }

            // Construct the full path to the resume file
            const fullPath = path.join(__dirname, '..', resumepath);

            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ error: "File not found !!" });
            }

            // Set the filename for download
            const candidateName = candidate.candidate.replace(/ /g, "_"); // Replace spaces with underscores
            const filename = `${candidateName}_resume.pdf`;

            // Send the file for download
            res.download(fullPath, filename, (err) => {
                if (err) {
                    console.error("Error downloading resume:", err);
                    return res.status(500).json({ error: "Error downloading resume", message: err.message });
                }
            });
        } else {
            return res.status(404).json({ error: "Candidate not found !!", id });
        }

    } catch (error) {
        console.error("Error downloading resume:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

exports.exportJD = async (req, res) => {
    try {
        const id = req.params.id;
        const position = await Position.findOne({ where: { id: id } });

        if (position) {
            let jdPath = position.jd_upload;
            console.log("=======>>>> JD path", jdPath);

            if (!jdPath) {
                return res.status(404).json({ error: "No JD found !!" });
            }

            // Construct the full path to the JD file
            const fullPath = path.join(__dirname, '..', jdPath);

            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ error: "File not found !!" });
            }

            // Send the file for download
            res.download(fullPath, (err) => {
                if (err) {
                    console.error("Error downloading Job Description:", err);
                    return res.status(500).json({error:"Error downloading Job Description", message: err.message });
                }
            });
        } else {
            return res.status(404).json({ error: "Position not found !!", id });
        }

    } catch (error) {
        console.error("Error downloading Job Description:", error);
        res.status(500).json({ error: "Internal Server Error", error:error.message });
    }
};

exports.FilteredUpdate = async (req, res) => {
    try {
        const recruiterId = req.params.id;

        // Fetch all candidate reports including their associated positions and recruiters
        const allReports = await Candidate.findAll({
            include: [
                {
                    model: Position,
                    required: true,
                    attributes: ["id", "position", "location"],
                    include: [
                        {
                            model: assignRecruiter,
                            required: true,
                            attributes: ["recruiter_id"],
                            where: { recruiter_id: recruiterId }
                        }
                    ]
                }
            ]
        });

        // Group the reports by sourcing_date
        let groupedReports = allReports.reduce((acc, report) => {
            const date = report.sourcing_date; // Ensure sourcing_date is being used correctly
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(report);
            return acc;
        }, {});

        let aggregatedData = [];

        for (let date in groupedReports) {
            const reports = groupedReports[date];

            let totalCvSourced = reports.length;
            let totalCvRelevant = reports.filter(report => report.relevant === "Yes").length;
            let totalConfirmationPending = reports.filter(report => report.sourcing_status === "Confirmation Pending").length;
            let totalSentToClient = reports.filter(report => report.sourcing_status === "Sent To Client").length;

            // Find the entry based on the update_date
            // let update = await Update.findOne({
            //     where: { update_date: date }
            // });

            // if (update) {
            //     // Update the existing entry
            //     await update.update({
            //         total_cv_sourced: totalCvSourced,
            //         total_cv_relevant: totalCvRelevant,
            //         total_confirmation_pending: totalConfirmationPending,
            //         total_sent_to_client: totalSentToClient
            //     });
            // } else {
            //     // Create a new entry
            //     update = await Update.create({
            //         update_date: date,
            //         total_cv_sourced: totalCvSourced,
            //         total_cv_relevant: totalCvRelevant,
            //         total_confirmation_pending: totalConfirmationPending,
            //         total_sent_to_client: totalSentToClient
            //     });
            // }

            aggregatedData.push({
                update_date: date,
                total_cv_sourced: totalCvSourced,
                total_cv_relevant: totalCvRelevant,
                total_confirmation_pending: totalConfirmationPending,
                total_sent_to_client: totalSentToClient
            });
        }

        return res.status(200).json({ report: aggregatedData });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
};
