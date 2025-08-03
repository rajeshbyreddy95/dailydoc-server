const cron = require("node-cron");
const Schedule = require("../models/Schedule");
const sendTaskAlert = require("../utils/mailer");

const runTaskReminderScheduler = () => {
  console.log("⏰ Task reminder scheduler started...");

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const today = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Fetch only tasks scheduled for today
      const allSchedules = await Schedule.find({
        "tasks.date": {
          $gte: today.toISOString().split("T")[0],
          $lt: tomorrow.toISOString().split("T")[0],
        },
      });

      for (const user of allSchedules) {
        for (const task of user.tasks) {
          const taskDateObj = new Date(task.date + "T00:00:00Z"); // Assume UTC
          taskDateObj.setHours(0, 0, 0, 0);

          if (taskDateObj.getTime() !== today.getTime()) {
            continue; // Skip tasks not scheduled for today
          }

          const [hour, minute] = task.startTime.split(":").map(Number);
          const taskStart = new Date(task.date + "T00:00:00Z");
          taskStart.setHours(hour, minute, 0, 0);

          const diffInMinutes = Math.round(
            (taskStart.getTime() - now.getTime()) / 60000
          );

          console.log(
            `🕒 Task: "${task.task}", User: ${user.username}, Date: ${task.date}, Start: ${task.startTime}, Diff: ${diffInMinutes} min`
          );

          if (diffInMinutes >= 4 && diffInMinutes <= 5 && !task.reminderSent) {
            await sendTaskAlert(user.username, task);
            task.reminderSent = true;
            await user.save();
            console.log(
              `📧 Reminder sent to ${user.username} for "${task.task}"`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in task reminder scheduler:", error);
    }
  });
};

module.exports = runTaskReminderScheduler;