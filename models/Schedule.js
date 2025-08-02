const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  date: { type: String, required: true }, // ISO date string
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },   // HH:mm
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

const scheduleSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  tasks: [taskSchema], // Embedded array of tasks
});

module.exports = mongoose.model('Schedule', scheduleSchema);
