const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const db = require('../Models/db');
const { Op, fn, col, where } = require('sequelize');
const excel = require('exceljs');


exports.getSourcingReportByDate = async (req, res) => {
    try {
        const dateFromParams = req.query.date;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit; 

        const download =req.query.download ? true : false;

        if(download) {
            limit= null;
            offset = null;
          };   

        const filter = req.query.filter ? JSON.parse(req.query.filter):"";

        const {position, company, candidate,cvSourcedFrom, relevant, status, location}= filter;

        console.log(position, company, candidate, cvSourcedFrom, relevant,status, location);

        const companyFilters = {};
       if (company) {
          companyFilters.company_name = { [Op.like]: `%${company}%` };
        }  
        if (location){
            companyFilters.location = { [Op.like]: `%${location}%`};
        }

        const positionFilter ={};
            if(position){
                positionFilter.position = {[Op.like]:`%${position}%`}

            }
        
            
        const whereClause = {
            sourcing_date: dateFromParams,
        };
        
        // [Op.and]: [
        //     where(fn('DATE', col('Candidates.created_at')), dateFromParams)
        // ]
        // if (candidate) whereClause[Op.and].push({ candidate: { [Op.like]: `%${candidate}%` } });
        // if (cvSourcedFrom) whereClause[Op.and].push({ cv_sourced_from: { [Op.like]: `%${cvSourcedFrom}%` } });
        // if (relevant) whereClause[Op.and].push({ relevant: { [Op.like]: `%${relevant}%` } });
        // if (status) whereClause[Op.and].push({ sourcing_status: { [Op.like]: `%${status}%` } });


        if (candidate) whereClause.candidate = { [Op.like]: `%${candidate}%` };
        if (cvSourcedFrom) whereClause.cv_sourced_from = { [Op.like]: `%${cvSourcedFrom}%` };
        if (relevant) whereClause.relevant = { [Op.like]: `%${relevant}%` };
        if (status) whereClause.sourcing_status = { [Op.like]: `%${status}%` };
     

        const [report, totalRecords] = await Promise.all([
            await Candidate.findAll({
                attributes: ['id', 'candidate', 'position', 'cv_sourced_from', 'relevant', 'sourcing_date','sourcing_status', 'remarks', 'created_at', 'updated_at'],
                include: [{
                    model: Position,
                    required: true,
                    attributes: ['id', 'company_id', 'position', 'location', 'experience', 'min_ctc', 'max_ctc'],
                    include: [{
                        model: Company,
                        required: true,
                        attributes: ['company_name'],
                        where: companyFilters,
                    }],
                    where: positionFilter
                }],
                where:whereClause,
                limit,
                offset
            }),

            await Candidate.count({
                attributes: ['id', 'candidate', 'position', 'cv_sourced_from', 'relevant', 'sourcing_status', 'remarks', 'created_at', 'updated_at'],
                include: [{
                    model: Position,
                    required: true,
                    attributes: ['id', 'company_id', 'position', 'location', 'experience', 'min_ctc', 'max_ctc'],
                    include: [{
                        model: Company,
                        required: true,
                        attributes: ['company_name']
                    }]
                }],
                where:whereClause,
            })

            
        ]);

        if(download){
             // Create Excel workbook and worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('AtsPipeline');

    // Add headers to the worksheet
    worksheet.addRow(['Candidate','Position','Candidate Status',
     'CV Sourced From','Relevent','Remarks', 
     'Company', 'Location','Experience','Min CTC','Max CTC']);

    // Add data rows to the worksheet
    report.forEach(report => {
        worksheet.addRow([
          report.candidate,
            report.Position.position,
            report.candidate_phone,
            report.candidate_email,
            report.candidate_location,
            report.candidate_experience,
            report.candidate_current_ctc,
            report.candidate_qualification,
            report.candidate_gender,
            report.candidate_status,
            report.cv_sourced_from,
            report.relevant,
            report.remarks,
            report.Position.Company.company_name,
            report.Position.experience,
            report.Position.min_ctc,
            report.Position.max_ctc, 
        ]);
    });

    // Generate a unique filename for the Excel file
     
    const filename = `Exported_atspipline.xlsx`;

    // Save the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send the Excel file as a response
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
        



        }else{
            let records = report.length;
            const pages = Math.ceil(filter? records/ limit: totalRecords / limit);
            res.status(200).json({ message: 'Candidates fetched successfully', totalRecords: filter? records: totalRecords, pages: pages, Candidates: report });
        }

       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
};