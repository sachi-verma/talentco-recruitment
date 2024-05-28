const express = require("express");
const nodemailer = require("nodemailer");
const nodeoutlook = require("nodejs-nodemailer-outlook");
const cors = require('cors');
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());


const transporter = nodemailer.createTransport({
    // service: "Outlook365",
    host: "insl2.managedns.org", // hostname
    secure: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    // tls: {
    //     ciphers: "SSLv3",
    //     rejectUnauthorized: false,
    // },  
    auth: {
      user: "noreply@abstarthr.com",
      pass: "TalentCo@ABStart"
    }
  });

exports.sendMail = async (req, res) => {
    const { to, subject, text } = req.body;

    if ( !to || !subject || !text) {
      return res.status(400).send("Missing required fields: to, subject, text");
    }
  
    const mailOptions = {
      from: '"TalentCo HR Recruitment" <recruitment@talentcohr.com>',
      to,
      subject,
      text
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email has been sent successfully');
      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
};