const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this to parse JSON request bodies

const Users = [];

// POST /api/users to create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  const _id = Date.now().toString();

  // Add a user to the Users array
  Users.push({ _id, username, log: [] });

  res.status(201).json({ username, _id }); // Return username and _id as required
});

// GET /api/users to get a list of all users
app.get('/api/users', (req, res) => {
  const usersList = Users.map(user => ({ username: user.username, _id: user._id })); // Return only username and _id
  res.json(usersList);
});

// POST /api/users/:_id/exercises to add an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const { description, duration, date } = req.body;

  if (!_id) {
    return res.status(400).json({ error: '_id is required!' });
  }

  if (!description) {
    return res.status(400).json({ error: 'Description is required!' });
  }

  if (!duration || isNaN(duration)) {
    return res.status(400).json({ error: 'Duration must be a number!' });
  }

  const user = Users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();

  const exercise = {
    description,
    duration: parseInt(duration), // Ensure duration is a number
    date: exerciseDate,
  };

  user.log.push(exercise);

  res.status(201).json({
    _id: user._id,
    username: user.username,
    date: exerciseDate,
    duration: parseInt(duration),
    description,
  });
});

// GET /api/users/:_id/logs to retrieve exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;

  const user = Users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  let logs = user.log;

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  const logsResponse = {
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs.map(log => ({
      description: log.description,
      duration: log.duration,
      date: log.date,
    })),
  };

  res.json(logsResponse);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});