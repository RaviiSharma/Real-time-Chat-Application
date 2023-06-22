const express = require('express');
const mysql = require('mysql');
const socketIO = require('socket.io');

const app = express();
const port = 5000;

// MySQL Connection Configuration
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
   //password:"Ravi@036",
    database: "exceldb",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to the database!');
});

// Socket.IO Setup
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = socketIO(server);

// Handle new connections
io.on('connection', (socket) => {
  console.log('New user connected');

  // Handle user registration
  socket.on('register', (data) => {
    const { username, password } = data;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

    db.query(query, [username, password], (err, results) => {
      if (err) {
        socket.emit('registrationError', { message: 'An error occurred during registration.' });
      } else {
        socket.emit('registrationSuccess');
      }
    });
  });

  // Handle joining chat rooms
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle receiving and broadcasting messages
  socket.on('chatMessage', (data) => {
    const { room, message } = data;
    io.to(room).emit('messageReceived', message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
