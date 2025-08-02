// utils/mailer.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
     user: 'kaitlinpetersenazzi@gmail.com',
    pass: 'yutn uwqv tusy fbqp'
  }
});

const sendTaskAlert = async (to, task) => {
    const htmlPath = path.join(__dirname, 'templates', 'taskReminderTemplate.html');
  let html = fs.readFileSync(htmlPath, 'utf8');


  html = html
    .replace('{{task}}', task.task)
    .replace('{{startTime}}', task.startTime)
    .replace('{{date}}', new Date(task.date).toLocaleDateString());

  const mailOptions = {
    from: '"Task Reminder" <alertmail@gmail.com>',
    to,
    subject: '⏰ Upcoming Task Alert',
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTaskAlert;
