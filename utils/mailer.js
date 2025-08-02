// utils/mailer.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
     user: process.env.email,
    pass: process.env.pass
  }
});

const sendTaskAlert = async (to, task) => {
  console.log(to, task);
  
    const htmlPath = path.join(__dirname, 'templates', 'taskReminderTemplate.html');
  let html = fs.readFileSync(htmlPath, 'utf8');


  html = html
    .replace('{{task}}', task.task)
    .replace('{{startTime}}', task.startTime)
    .replace('{{date}}', new Date(task.date).toLocaleDateString());

  const mailOptions = {
    from:`"Task Reminder" <${process.env.email}>`,
    to,
    subject: '⏰ Upcoming Task Alert',
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTaskAlert;
