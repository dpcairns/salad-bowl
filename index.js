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

let canonicalBowl = {};
let bowl = {};

io.on('connection', (socket) => {
    io.sockets.emit('bowlAccessed', bowl);

    // when the client emits 'typing', we broadcast it to others
    socket.on('add to bowl', (item) => {
        bowl[item] = true;
        canonicalBowl[item] = true;

        io.sockets.emit('added to bowl', bowl);
    });


    socket.on('pick one', () => {
        const items = Object.keys(bowl);
        const randomIndex = Math.floor(Math.random() * items.length);
        const itemToRemove = items[randomIndex]
        delete bowl[itemToRemove];

        console.log(itemToRemove)
        io.sockets.emit('picked one', {
            removed: itemToRemove,
            bowl
        });
    });

    socket.on('refresh bowl', () => {
        bowl = { ...canonicalBowl };

        console.log(canonicalBowl)
        io.sockets.emit('refreshed bowl', {
            bowl: canonicalBowl,
        });
    });


    socket.on('clear bowl', () => {
        bowl = {};
        canonicalBowl = {}

        io.sockets.emit('cleared bowl', {
            bowl: {},
        });
    });
});