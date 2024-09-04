// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT =  5000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // When a user joins a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', { signal: null, callerID: socket.id });

    // Notify the new user about existing users
    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    io.to(socket.id).emit('all-users', usersInRoom.filter(id => id !== socket.id));
  });

  // Handling sending a signal to another user
  socket.on('sending-signal', ({ userToSignal, callerID, signal }) => {
    io.to(userToSignal).emit('user-joined', { signal, callerID });
  });

  // Handling returning a signal from another user
  socket.on('returning-signal', ({ signal, callerID }) => {
    io.to(callerID).emit('receiving-returned-signal', { signal, id: socket.id });
  });

  // Handling disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Notify other users in the room that someone has disconnected
    io.sockets.adapter.rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
