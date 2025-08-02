const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const sendTaskAlert = require('../utils/mailer');

const runTaskReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const inFiveMinutes = new Date(now.getTime() + 5 * 60000); // +5 minutes

    const currentDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

    const allSchedules = await Schedule.find({});

    for (const user of allSchedules) {
      for (const task of user.tasks) {
        const taskDate = new Date(task.date).toLocaleDateString('en-CA');

        if (taskDate === currentDate) {
          const [hour, minute] = task.startTime.split(':').map(Number);

          const taskStart = new Date(task.date);
          taskStart.setHours(hour, minute, 0, 0);

          if (
            Math.abs(taskStart.getTime() - inFiveMinutes.getTime()) < 60000
          ) {
            await sendTaskAlert(user.username, task);
            console.log(`📧 Reminder sent to ${user.username} for "${task.task}"`);
          }
        }
      }
    }
  });
};

module.exports = runTaskReminderScheduler;