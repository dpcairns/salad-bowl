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
let whoseTurn = null;
let users = {}
let gameIsRunning = false;

io.on('connection', (socket) => {
    io.sockets.emit('bowlAccessed', {
        bowl,
        currentTurnUser: whoseTurn,
        gameIsRunningServer: gameIsRunning
    });
    socket.on('login', (({ userId }) => {
        if (!users[userId]) users[userId] = true;
    }));

    // when the client emits 'typing', we broadcast it to others
    socket.on('add to bowl', ({ item, userId }) => {
        bowl[item] = true;
        canonicalBowl[item] = true;

        io.sockets.emit('added to bowl', bowl);
    });

    socket.on('toggleRunningGame', (gameState) => {
        gameIsRunning = gameState;
        socket.emit('gameStateChanged', gameState)
    })

    socket.on('pick one', ({ userId }) => {
        const items = Object.keys(bowl);
        const randomIndex = Math.floor(Math.random() * items.length);
        const itemToRemove = items[randomIndex]
        delete bowl[itemToRemove];

        io.sockets.emit('picked one', {
            removed: itemToRemove,
            bowl
        });
    });

    socket.on('refresh bowl', ({ userId }) => {
        bowl = { ...canonicalBowl };

        io.sockets.emit('refreshed bowl', {
            bowl: canonicalBowl,
        });
    });

    socket.on('my turn', ({ userId }) => {
        whoseTurn = userId

        io.sockets.emit('whose turn', userId);
    });

    socket.on('clear bowl', ({ userId }) => {
        bowl = {};
        canonicalBowl = {}

        io.sockets.emit('cleared bowl', {
            bowl: {},
        });
    });
});