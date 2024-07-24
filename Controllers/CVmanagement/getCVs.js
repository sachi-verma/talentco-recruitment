const CV = require('../../Models/CVmanagment/allCV');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

exports.getAllCVs = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;
        const whereClause = {};
        const upload = req.query.upload ? true : false;

        const filter = req.query.filter ? JSON.parse(req.query.filter) : "";
        const {candidateName, skills,summary, industry, currentCompany, currentDesignation, currentLocation, experience, ugDegree, ugSpecialization, orderBy, orderDirection } = filter;
       
        // if (upload) {
        //     whereClause.resume = null;
        //     order = [["uploaded_at", "DESC"]];
        // }

        let order =[[Sequelize.col("uploaded_at"), "DESC"]];

        if (orderBy && orderDirection) {
        //   const validColumns = {
        //     upload_date: "job_title",
        //     skills: "skills",
        //     position: "summary",
        //     position: "industry",
        //     position: "current_location",
        //     position: "experience",
        //     position: "current_designation",
        //     position: "ug_degree",
        //     position: "ug_spl",
        //     position: "pg_degree",
        //     position: "pg_spl",
        //     position: "cand_name",
        //     position: "func_area",
        //     position: "current_company",
        //     position: "preferred_location",
        //     position: "annual_salary",
        //     position: "notice_period",
        //     position: "dob",
        //     position: "age",
        //     position: "marital_status",
        //     position: "phone",
        //     position: "email",
        //     position: "gender",
        //     position: "work_permit",
        //   };
            order = [[Sequelize.col(orderBy), orderDirection]];
          
        }

        const [report, totalRecords] = await Promise.all([

            await CV.findAll({
                where: whereClause,
                order: order,
                limit,
                offset
            }),
            await CV.count(),

        ]);
        const pages = Math.ceil(totalRecords / limit);
        res.status(200).json({ msg: "Report fetched successfully !!", totalRecords: totalRecords, pages: pages, report: report });

    } catch (error) {

        console.log("error getting CVs", error);
        res.status(500).json({ error: "internal server error" });
    }
};

exports.importExcel = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Invalid file' });
        }

        console.log("=====>>>>>", req.file);
        // Parse the Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const successData = [];
        const errorData = [];
        let filename = req.file ? req.file.filename : null;

        const columnMapping = {
            'Job Title': 'job_title',
            'Name': 'cand_name',
            'Email ID': 'email',
            'Phone Number': 'phone',
            'Current Location': 'current_location',
            'Preferred Locations': 'preferred_location',
            'EXP IN years number': 'experience',
            'Curr. Company name': 'current_company',
            'Curr. Company Designation': 'current_designation',
            'Functional Area': 'func_area',
            'Industry': 'industry',
            'Key Skills': 'skills',
            'Annual Salary in numeric': 'annual_salary',
            'Notice period in days only': 'notice_period',
            'Summary': 'summary',
            'Under Graduation degree': 'ug_degree',
            'UG Specialization': 'ug_spl',
            'Post graduation degree': 'pg_degree',
            'Post graduation Specialization': 'pg_spl',
            'Gender': 'gender',
            'Marital Status': 'marital_status',
            'Work permit for USA': 'work_permit',
            'Date of birth': 'dob',
            'Age': 'age',
        };

        for (const row of sheet) {
            const transformedRow = {};
            for (const [excelColumn, key] of Object.entries(columnMapping)) {
                transformedRow[key] = row[excelColumn] || null;
            }
            console.log("====>Now here", transformedRow);

            // Parse and format the date of birth if it exists

            const {
                job_title,
                cand_name,
                email,
                phone,
                current_location,
                preferred_location,
                experience,
                current_company,
                current_designation,
                func_area,
                industry,
                skills,
                annual_salary,
                notice_period,
                summary,
                ug_degree,
                ug_spl,
                pg_degree,
                pg_spl,
                gender,
                marital_status,
                work_permit,
                dob,
                age,
            } = transformedRow;

            try {
                const result = await CV.create({
                    job_title,
                    cand_name,
                    email,
                    phone,
                    current_location,
                    preferred_location,
                    experience,
                    current_company,
                    current_designation,
                    func_area,
                    industry,
                    skills,
                    annual_salary,
                    notice_period,
                    summary,
                    ug_degree,
                    ug_spl,
                    pg_degree,
                    pg_spl,
                    gender,
                    marital_status,
                    work_permit,
                    dob,
                    age,
                    filename
                });

                if (result) {
                    successData.push(row);
                } else {
                    errorData.push(row);
                }
            } catch (err) {
                console.error('Error inserting row: ', err.message);
                errorData.push(row);
            }
        }

        // Delete the uploaded file after processing
        // fs.unlinkSync(req.file.path);

        res.status(200).json({ msg: "Successful!!!", successData: successData, errorData: errorData });

    } catch (error) {
        console.log("Error posting CVs", error);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        const id = req.params.id;
        let filename;
        
        if (req.file) {
            filename = req.file.path;
        } else {
            return res.status(404).json({ error: 'No Resume File Found !!' });
        }

        const candidate = await CV.findByPk(id);

        if (candidate) {
            await CV.update({ resume: filename }, { where: { id: id } });
            return res.status(200).json({ message: 'Resume uploaded successfully' });
        } else {
            return res.status(404).json({ error: 'Candidate not found' });
        }
 
    } catch (error) {
        console.log("Error in uploading resume", error);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.exportResumes = async (req, res) => {
    try {
        const id = req.params.id;
        const candidate = await CV.findByPk(id);

        if (candidate) {
            let resumepath = candidate.resume;

            if (!resumepath) {
                return res.status(404).json({ error: "No resume found !!" });
            }

            // Construct the full path to the resume file
            const fullPath = path.join(__dirname, '..','..', resumepath);

            // Check if the file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ error: "File not found !!" });
            }

            // Set the filename for download
            const candidateName = candidate.cand_name.replace(/ /g, "_"); // Replace spaces with underscores
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