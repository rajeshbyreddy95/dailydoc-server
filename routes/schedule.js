const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");

// Helper: Normalize date to 'YYYY-MM-DD'
function normalizeDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

// ----------------- Routes ------------------ //

// 🧪 Test route
router.get("/demo/test", (req, res) => {
  res.json({ message: "Test route works" });
});

// 📝 Save or update schedule
router.post("/save-schedule", async (req, res) => {
  const { username, tasks } = req.body;

  if (!username || !Array.isArray(tasks)) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const existing = await Schedule.findOne({ username });

    if (existing) {
      existing.tasks = [...existing.tasks, ...tasks];
      await existing.save();
    } else {
      await Schedule.create({ username, tasks });
    }

    res.status(200).json({ message: "Tasks saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 View tasks based on mode/date
router.post("/view", async (req, res) => {
  const { username, mode, date } = req.body;
  console.log("🔍 /schedule/view Request:", { username, mode, date });

  if (!username || !mode) {
    return res.status(400).json({ message: "Username and mode are required." });
  }

  try {
    const userSchedule = await Schedule.findOne({ username });
    if (!userSchedule) {
      return res.status(404).json({ message: "User schedule not found." });
    }

    const today = new Date().toLocaleDateString("en-CA");
    let filteredTasks = [];

    if (mode === "today") {
      filteredTasks = userSchedule.tasks.filter(task => normalizeDate(task.date) === today);
    } else if (mode === "previous") {
      filteredTasks = userSchedule.tasks.filter(task => normalizeDate(task.date) < today);
    } else if (mode === "specific") {
      if (!date) {
        return res.status(400).json({ message: "Date is required for specific mode." });
      }
      const inputDate = normalizeDate(date);
      filteredTasks = userSchedule.tasks.filter(task => normalizeDate(task.date) === inputDate);
    } else {
      return res.status(400).json({ message: "Invalid mode provided." });
    }

    res.status(200).json({ tasks: filteredTasks });
  } catch (err) {
    console.error("❌ Error in /schedule/view:", err);
    res.status(500).json({ message: "Server error while fetching schedule." });
  }
});

// ❌ Delete task (placeholder logic)
router.post("/taskdelete", (req, res) => {
  console.log("Received task delete request:", req.body);
  res.json({ message: "Server is working for task delete" });
});

// ✅ Update task status
router.put("/update-status/:username", async (req, res) => {
  const { username } = req.params;
  const { taskId, status } = req.body;

  try {
    const userSchedule = await Schedule.findOne({ username });
    if (!userSchedule) {
      return res.status(404).json({ message: "User schedule not found" });
    }

    const task = userSchedule.tasks.find(t => t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await userSchedule.save();

    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📥 Fetch entire schedule by username (MUST come last)
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const schedule = await Schedule.findOne({ username });
    if (!schedule) {
      return res.status(404).json({ message: "No schedule found" });
    }

    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schedule" });
  }
});

module.exports = router;
