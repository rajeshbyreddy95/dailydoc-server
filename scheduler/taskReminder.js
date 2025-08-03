const cron = require("node-cron");
const Schedule = require("../models/Schedule");
const sendTaskAlert = require("../utils/mailer");

const runTaskReminderScheduler = () => {
  console.log("⏰ Task reminder scheduler started...");

  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-CA"); // e.g., 2025-08-01

    const allSchedules = await Schedule.find({});

    for (const user of allSchedules) {
      for (const task of user.tasks) {
        const taskDateObj = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDateObj.setHours(0, 0, 0, 0);

        if (taskDateObj.getTime() !== today.getTime()) {
          continue; // Skip tasks not scheduled for today
        }

        const [hour, minute] = task.startTime.split(":").map(Number);
        const taskStart = new Date(task.date);
        taskStart.setHours(hour, minute, 0, 0);

        const diffInMinutes = Math.round(
          (taskStart.getTime() - now.getTime()) / 60000
        );

        console.log(
          `🕒 Checking task "${task.task}" for ${user.username}: starts in ${diffInMinutes} min`
        );

        if (diffInMinutes === 5) {
          await sendTaskAlert(user.username, task);
          console.log(
            `📧 Reminder sent to ${user.username} for "${task.task}"`
          );
        }
      }
    }
  });
};

module.exports = runTaskReminderScheduler;
