// Assuming you're using Express and Mongoose
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule'); // adjust the path to your model

router.get('/profile', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required.' });
  }

  try {
    const userSchedule = await Schedule.findOne({ username });

    if (!userSchedule || !userSchedule.tasks) {
      return res.status(200).json({ total: 0, completed: 0, tasks: [] });
    }

    const total = userSchedule.tasks.length;
    const completed = userSchedule.tasks.filter(t => t.status === 'completed').length;

    res.status(200).json({ total, completed, tasks: userSchedule.tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile stats.' });
  }
});

module.exports = router;
