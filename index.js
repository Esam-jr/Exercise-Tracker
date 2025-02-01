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

const Users = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ err: "Username required" });
  }

  const _id = Date.now().toString();

  // Use push to add a user to the Users array
  Users.push({ _id, username, log: [] }); // Add log array for each user

  res.status(201).json({ 'username': username, 'id': _id });
});

app.get('/api/users', (req, res) => {
  res.json(Users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;

  if (!_id) {
    return res.status(401).json('_id is required!');
  }

  if (!description) {
    return res.status(401).json('Description is required!');
  }

  if (!duration) {
    return res.status(401).json('Duration is required!');
  }

  if (!date) {
    date = new Date().toDateString();
  }

  const user = Users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  user.log.push({ description, duration, date });

  res.status(201).json({
    '_id': _id,
    'username': user.username,
    'date': date,
    'duration': duration,
    'description': description,
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;

  const user = Users.find(u => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found!' });
  }

  let logs = user.log;

  if (from) {
    logs = logs.filter(log => new Date(log.date) >= new Date(from));
  }

  if (to) {
    logs = logs.filter(log => new Date(log.date) <= new Date(to));
  }

  if (limit) {
    logs = logs.slice(0, limit);
  }

  const logsResponse = {
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs,
  };

  res.json(logsResponse);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
