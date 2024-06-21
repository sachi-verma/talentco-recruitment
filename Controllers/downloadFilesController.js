const path = require("path");
const fs = require("fs");
const Candidate = require("../Models/allCandidates");
const Position = require("../Models/allPositions");


exports.exportResumes = async (req, res) => {
    try {
        const id = req.params.id;
        const candidate = await Candidate.findOne({ where: { id: id } });

        if (candidate) {
            let resumepath = candidate.candidate_resume;
            console.log("=======>>>> resume path", resumepath);

            if (!resumepath) {
                return res.status(404).json({ error: "No resume found !!" });
            }

            // Construct the full path to the resume file
            const fullPath = path.join(__dirname, '..', resumepath);

            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ error: "File not found !!" });
            }

            // Send the file for download
            res.download(fullPath, (err) => {
                if (err) {
                    console.error("Error downloading resume:", err);
                    return res.status(500).json({error:"Error downloading Resume", message: err.message });
                }
            });
        } else {
            return res.status(404).json({ error: "Candidate not found !!", id });
        }

    } catch (error) {
        console.error("Error downloading resume:", error);
        res.status(500).json({ error: "Internal Server Error", error:error.message });
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