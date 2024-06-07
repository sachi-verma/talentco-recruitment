const db = require('../Models/db');
const { Sequelize, where} = require('sequelize');
const Position = require('../Models/allPositions');



exports.getDashBoradReport = async (req, res) => {
    try {
        const whereClause ={
            position_status: 'Open',
        };

        const result = await Position.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('id')), 'total_open_positions' ],
                [Sequelize.fn('SUM', Sequelize.col('cv_sent')), 'total_cv_sent'],
                [Sequelize.fn('SUM', Sequelize.col('cv_shortlisted')), 'total_cv_shortlisted'],
                [Sequelize.fn('SUM', Sequelize.col('cv_backout')), 'total_cv_backout'],
                [Sequelize.fn('SUM', Sequelize.col('cv_interviewed')), 'total_cv_interviewed'],
                [Sequelize.fn('SUM', Sequelize.col('cv_rejected_post_interview')), 'total_cv_rejected_post_interview'],
                [Sequelize.fn('SUM', Sequelize.col('cv_feedback_pending')), 'total_cv_feedback_pending'],
                [Sequelize.fn('SUM', Sequelize.col('cv_final_selection')), 'total_cv_final_selection'],
                [Sequelize.fn('SUM', Sequelize.col('cv_offer_letter_sent')), 'total_cv_offer_letter_sent'],
                [Sequelize.fn('SUM', Sequelize.col('cv_final_join')), 'total_cv_final_join'],
                [Sequelize.fn('SUM', Sequelize.col('cv_confirmation_pending')), 'total_cv_confirmation_pending'],
                [Sequelize.fn('SUM', Sequelize.col('cv_screened')), 'total_cv_screened']
            ],
            where: whereClause,
        });

        const data = result[0].dataValues;
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}