const db = require('../Models/db');

exports.createSourcingReport = (req, res) => {
  const { id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date } = req.body;

  db.query(
    'INSERT INTO daily_sourcing_report (id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, candidate, company, position, location, ctc, cv_sourced_from, relevant, candidate_status, remarks, sourcing_date],
    (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log(results);
        res.status(200).json({ message: 'Role created successfully' });
      }
    }
  );
};

exports.getFilteredUpdate = (req, res) => {
    const { date } = req.query; 
    const queryTotalCvSourced = `SELECT COUNT(*) AS total_cv_sourced
                                  FROM daily_sourcing_report
                                  WHERE DATE(sourcing_date) = ?`;

    const queryTotalCvRelevant = `SELECT COUNT(*) AS total_cv_relevant
                                   FROM daily_sourcing_report
                                   WHERE relevant = 'yes'
                                   AND DATE(sourcing_date) = ?`;

    const queryTotalConfirmationPending = `SELECT COUNT(*) AS total_confirmation_pending
                                           FROM daily_sourcing_report
                                           WHERE candidate_status = 'confirmation pending'
                                           AND DATE(sourcing_date) = ?`;

    const queryTotalSentToClient = `SELECT COUNT(*) AS total_sent_to_client
                                     FROM daily_sourcing_report
                                     WHERE candidate_status = 'sent to client'
                                     AND DATE(sourcing_date) = ?`;

    connection.query(queryTotalCvSourced, [date], (error, resultsTotalCvSourced) => {
        if (error) throw error;
        const totalCvSourced = resultsTotalCvSourced[0].total_cv_sourced;

        connection.query(queryTotalCvRelevant, [date], (error, resultsTotalCvRelevant) => {
            if (error) throw error;
            const totalCvRelevant = resultsTotalCvRelevant[0].total_cv_relevant;

            connection.query(queryTotalConfirmationPending, [date], (error, resultsTotalConfirmationPending) => {
                if (error) throw error;
                const totalConfirmationPending = resultsTotalConfirmationPending[0].total_confirmation_pending;

                connection.query(queryTotalSentToClient, [date], (error, resultsTotalSentToClient) => {
                    if (error) throw error;
                    const totalSentToClient = resultsTotalSentToClient[0].total_sent_to_client;

                    const querySourcingUpdate = `UPDATE daily_sourcing_update 
                                               SET total_cv_sourced = ?, 
                                                   total_cv_relevant = ?, 
                                                   total_confirmation_pending = ?, 
                                                   total_sent_to_client = ? 
                                               WHERE update_date = ?`;

                    connection.query(querySourcingUpdate, [totalCvSourced, totalCvRelevant, totalConfirmationPending, totalSentToClient, date], (error, results) => {
                        if (error) throw error;
                        console.log('Daily Sourcing updated successfully.');
                        res.send('Daily Sourcing updated successfully.');
                    });
                });
            });
        });
    });
}