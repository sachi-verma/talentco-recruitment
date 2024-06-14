const db = require('../Models/db');
const { Op } = require('sequelize');
const Candidate = require('../Models/allCandidates');
const Position = require('../Models/allPositions');
const Company = require('../Models/companyDetails');
const Status = require('../Models/statusHistory');
const sourcingReportByRecruiter = require("../Models/sourcingReportByRecruiter");

exports.getAtsPipeline = async (req, res) => {
    try {
        const report = await Candidate.findAll({
            attributes: ['id', 'candidate', 'position', 'candidate_phone', 'candidate_email', 'candidate_location', 'candidate_experience', 'candidate_ctc', 'candidate_qualification', 'candidate_gender', 'cv_sourced_from', 'relevant', 'candidate_status', 'remarks', 'created_at', 'updated_at'],
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
            where: {
                // candidate_status: {
                //     [Op.ne]: 'sent to client'
                //     //Op is the object and ne stands for not equal
                // }
                sourcing_status: 'Sent To Client',
            }
            // where: {
            //     candidate_status: {
            //       [Op.or]: ['Sent To Client', 'Shortlisted', 'Interview Done', 'Selected', 'Not Selected', 'Backout']
            //     }
            //   }
        });
        res.status(200).json({ message: 'candidates fetched successfully', Candidates: report });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}

exports.editAtsPipeline = async (req, res) => {
    try {
        const id = req.params.id;
        const { candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks } = req.body;
        const candidate_resume = req.file ? req.file.path : null;
        await Candidate.update({ candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks, candidate_resume }, { where: { id: id } });

        return res.status(200).json({ success: "candidate data updated sucessfully", candidate: { id, candidate_phone, candidate_email, candidate_location, candidate_experience, candidate_current_ctc, candidate_qualification, candidate_gender, candidate_alt_phone, candidate_expected_ctc,candidate_designation,candidate_notice_period, candidate_remarks, candidate_resume} });

    } catch (error) {
        console.error('Error updating candidate:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

exports.editAtsStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { candidate_status, status_date, recruiter_id } = req.body;

        let candidate;
        let status;
        let incrementUpdate ;

        let statusExist = await Status.findOne({where:{id: id , candidate_status: candidate_status}});
        if(statusExist){
            return res.status(404).json({error: "Can't change the status of candidate", candidate_status, id})
        }
        else{
               //changing the status in all candidates table
        candidate = await Candidate.update({ candidate_status, status_date }, { where: { id: id } });

        //creating a new status to add in status history
       
        status = await Status.create({ candidate_id: id, candidate_status: candidate_status, status_date: status_date });

   
        
        // // //changing the status in all candidates table
        // const candidate = await Candidate.update({ candidate_status, status_date }, { where: { id: id } });

        // //creating a new status to add in status history
       
        // const status = await Status.create({ candidate_id: id, candidate_status: candidate_status, status_date: status_date });

    //changes
    let response;
    let result

let recruiter = await sourcingReportByRecruiter.findOne({where:{recruiter_id:recruiter_id, date:status_date}})
if (recruiter){

    if(candidate_status === 'CV Rejected'){
        await sourcingReportByRecruiter.increment(
            { cv_rejected: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })


    }else if(candidate_status === 'Shortlisted'){
        await sourcingReportByRecruiter.increment(
            { shortlisted: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })


    }else if(candidate_status === 'Interview Scheduled'){
        await sourcingReportByRecruiter.increment(
            { interview_schedule: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })


    }else if(candidate_status === 'Interview Done'){
        await sourcingReportByRecruiter.increment(
            { interview_done: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if(candidate_status === 'Rejected Post Interview'){
        await sourcingReportByRecruiter.increment(
            { reject_post_interview: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if(candidate_status === 'Final Selection'){
        await sourcingReportByRecruiter.increment(
            { final_selection: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if(candidate_status === 'Offer Letter Sent'){
        await sourcingReportByRecruiter.increment(
            { offer_letter_sent: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if(candidate_status === 'Final Joining'){
        await sourcingReportByRecruiter.increment(
            { final_joining: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if(candidate_status === 'Backout'){
        await sourcingReportByRecruiter.increment(
            { feedback_pending: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }else if (candidate_status === 'Feedback Pending'){
        await sourcingReportByRecruiter.increment(
            { backout: 1 },
            { where: { recruiter_id: recruiter_id,date: date}  })

        
    }
}
else{
   // response = await sourcingReportByRecruiter.create({recruiter_id:recruiter_id, date:status_date, });
    if(candidate_status === 'CV Rejected'){
        await sourcingReportByRecruiter.create(
            { cv_rejected: 1,recruiter_id: recruiter_id,date: date })
             


    }else if(candidate_status === 'Shortlisted'){
        await sourcingReportByRecruiter.create(
            { shortlisted: 1,recruiter_id: recruiter_id,date: date })
           


    }else if(candidate_status === 'Interview Scheduled'){
        await sourcingReportByRecruiter.create(
            { interview_schedule: 1,recruiter_id: recruiter_id,date: date })
           


    }else if(candidate_status === 'Interview Done'){
        await sourcingReportByRecruiter.create(
            { interview_done: 1 , recruiter_id: recruiter_id,date: date})
           

        
    }else if(candidate_status === 'Rejected Post Interview'){
        await sourcingReportByRecruiter.create(
            { reject_post_interview: 1,recruiter_id: recruiter_id,date: date })

        
    }else if(candidate_status === 'Final Selection'){
        await sourcingReportByRecruiter.create(
            { final_selection: 1,recruiter_id: recruiter_id,date: date }
             )

        
    }else if(candidate_status === 'Offer Letter Sent'){
        await sourcingReportByRecruiter.create(
            { offer_letter_sent: 1,recruiter_id: recruiter_id,date: date },
             )

        
    }else if(candidate_status === 'Final Joining'){
        await sourcingReportByRecruiter.create(
            { final_joining: 1,recruiter_id: recruiter_id,date: date },
             )

        
    }else if(candidate_status === 'Backout'){
        await sourcingReportByRecruiter.create(
            { feedback_pending: 1,recruiter_id: recruiter_id,date: date },
             )

        
    }else if (candidate_status === 'Feedback Pending'){
        await sourcingReportByRecruiter.create(
            { backout: 1 ,recruiter_id: recruiter_id,date: date},
            )

        
    }

}
        
    
    
    
    
    
    const candidateinfo= await Candidate.findByPk(id);
        console.log(candidateinfo.position);

        const position= candidateinfo.position;

        if(candidate_status === 'CV Rejected'){
 
         incrementUpdate = await Position.increment(
             { cv_rejected: 1 },
             { where: { id: position } }
         );
 
        } else if(candidate_status === 'Shortlisted'){
         incrementUpdate = await Position.increment(
             { cv_shortlisted: 1 },
             { where: { id: position}  }
         );
        }
        else if(candidate_status === 'Backout'){
 
         incrementUpdate = await Position.increment(
             { cv_backout: 1 },
             { where: { id: position } }
         );
 
        } else if(candidate_status ==='Interview Done'){
 
         incrementUpdate = await Position.increment(
             { cv_interviewed: 1 },
             { where: { id: position } }
         );
        }
 
        if(incrementUpdate){
         console.log('Increment updateed position table' , incrementUpdate);
        }
    }

        return res.status(200).json({ success: "candidate status updated sucessfully", candidate: { id, candidate_status, status_date }, status });

    } catch (error) {
        console.error('Error updating candidate status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


exports.getStatusHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const history = await Status.findAll({
            attributes: ['id', 'candidate_status', 'status_date'],
            where: { candidate_id: id }
        });
        res.status(200).json({ message: 'Status history fetched successfully', history });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('500 server error');
    }
}
