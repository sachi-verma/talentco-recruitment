const express = require('express');
const bodyParser = require('body-parser');
const { port } = require('./Config/config');
const corsMiddleware = require('./Middleware/corsMiddleware');
const errorHandler = require('./Middleware/errorHandler');
const {sequelize, connectToDb} = require('./Models/db');
const path = require('path');

const roleRoutes = require('./Routes/roleRoutes');
const moduleRoutes = require('./Routes/moduleRoutes');
const companyRoutes = require('./Routes/companyRoutes');
const permissionRoutes = require('./Routes/permissionRoutes');
const jobRoutes = require('./Routes/jobRoutes');
const dailySourcingRoutes = require('./Routes/dailySourcingRoutes');
const assignRecruiterRoutes = require('./Routes/assignRecruiterRoutes');
const atsPipelineRoutes = require('./Routes/atsPipelineRoutes');
const emailRoutes = require('./Routes/emailRoutes');
const interviewRoutes = require('./Routes/interviewRoutes');
const screenedCandidateRoutes = require('./Routes/screenedCandidateRoutes');
const loginRoutes = require('./Routes/loginRoutes');
const authRoutes = require('./Routes/authRoutes');
const protectedRoutes = require('./Routes/protectedRoutes');
const userRoutes = require('./Routes/userRoutes');

const dashboardRoutes = require('./Routes/dashboardRoutes');
const reportAndAnalysis = require('./Routes/reportAndAnalysisRoute');
const downloadFileController = require('./Routes/downloadFileRoutes');


const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(roleRoutes);
app.use(moduleRoutes);
app.use(companyRoutes);
app.use(permissionRoutes);
app.use(jobRoutes);
app.use(dailySourcingRoutes);
app.use(assignRecruiterRoutes);
app.use(atsPipelineRoutes);
app.use(loginRoutes);
app.use(emailRoutes);
app.use(interviewRoutes);
app.use(screenedCandidateRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(reportAndAnalysis);
app.use(downloadFileController);

//https://atsapi.abstarthr.in/restartNodeServer
//route to restart the server
app.post('/restartNodeServer', (req, res) => {
  exec('pm2 restart ATS --watch', (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).send('Error restarting server');
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      res.send('Server restarted successfully');
  });
});

// Route to read and return the log file content
app.get('/logs', (req, res) => {
  const logFilePath = '/root/.pm2/logs/ATS-error.log'; // Your log file path

  exec(`tail -n 100 ${logFilePath}`, (error, stdout, stderr) => {
      if (error) {
          console.error('Error executing tail command:', error);
          return res.status(500).send('Error reading log file');
      }

      res.send(stdout);
  });
});

// app.use("/protected_routes", protectedRoutes);
app.use(userRoutes);

app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectToDb();
});
