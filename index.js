// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

const canonicalBowl = {};
let bowl = {};

io.on('connection', (socket) => {
    socket.sockets.emit('bowlAccessed', bowl);

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('add to bowl', (item) => {
        bowl[item] = true;
        canonicalBowl[item] = true;

        socket.sockets.emit('added to bowl', bowl);
    });


    socket.on('pick one', () => {
        const items = Object.keys(bowl);
        const randomIndex = Math.floor(Math.random() * items.length);
        const itemToRemove = items[randomIndex]
        delete bowl[itemToRemove];

        console.log(itemToRemove)
        socket.sockets.emit('picked one', {
            removed: itemToRemove,
            bowl
        });
    });

    socket.on('refresh bowl', () => {
        bowl = canonicalBowl;

        socket.sockets.emit('refreshed bowl', {
            bowl: canonicalBowl,
        });
    });
});