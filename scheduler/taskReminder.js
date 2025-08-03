const cron = require("node-cron");
const Schedule = require("../models/Schedule");
const sendTaskAlert = require("../utils/mailer");

const runTaskReminderScheduler = () => {
  console.log("⏰ Task reminder scheduler started...");

  cron.schedule("* * * * *", async () => {
    try {
      // Current time in IST
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const today = new Date(now);
      today.setHours(0, 0, 0, 0); // Start of today in IST
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Fetch tasks scheduled for today
      const allSchedules = await Schedule.find({
        "tasks.date": {
          $gte: today.toISOString().split("T")[0],
          $lt: tomorrow.toISOString().split("T")[0],
        },
      });

      for (const user of allSchedules) {
        for (const task of user.tasks) {
          // Parse task date in IST
          const taskDateObj = new Date(
            new Date(task.date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          );
          taskDateObj.setHours(0, 0, 0, 0);

          // Skip if not today
          if (taskDateObj.getTime() !== today.getTime()) {
            continue;
          }

          // Parse task start time in IST
          const [hour, minute] = task.startTime.split(":").map(Number);
          // Create taskStart in IST by combining date and time
          const taskStartIST = new Date(
            new Date(`${task.date}T${task.startTime}:00+05:30`).toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            })
          );

          // Skip tasks that have already passed
          if (taskStartIST.getTime() < now.getTime()) {
            console.log(
              `⏮️ Skipping past task: "${task.task}", User: ${user.username}, Date: ${task.date}, Start: ${task.startTime}`
            );
            continue;
          }

          const diffInMinutes = Math.round(
            (taskStartIST.getTime() - now.getTime()) / 60000
          );

          console.log(
            `🕒 Task: "${task.task}", User: ${user.username}, Date: ${task.date}, Start: ${task.startTime}, Diff: ${diffInMinutes} min, TaskStart: ${taskStartIST.toISOString()}, Now: ${now.toISOString()}`
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