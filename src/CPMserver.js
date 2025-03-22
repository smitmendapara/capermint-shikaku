const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const logger = require('./utils/CPMlogger.utils');
const setupGameSocket = require('./sockets/CPMgame.sockets');
require('dotenv').config();

// * Express Setup
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// * Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shikaku')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// * Main Route
app.get('/', (req, res) => {
  res.render('CPMgame');
});

// * Socket Setup
setupGameSocket(io);

// * Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 