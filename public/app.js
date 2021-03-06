var socket = io();

let userId = localStorage.getItem('userId');

const bowlDiv = document.getElementById('bowl');

const input = document.getElementById('add-input');
const addForm = document.getElementById('add-form')
const refreshButton = document.getElementById('refresh-button')
const pickOne = document.getElementById('pick-one')
const toggleButton = document.getElementById('toggle-button')
const pickedSpan = document.getElementById('picked')
const pickedDiv = document.getElementById('picked-div')
const itemsCount = document.getElementById('items-count')
const clearAllBowls = document.getElementById('clear')
// const myTurn = document.getElementById('toggle-my-turn');
const userInputForm = document.getElementById('user-form');
const userInput = document.getElementById('user-input');
const takeTurn = document.getElementById('take-turn');
const turnSpan = document.getElementById('turn');
const turnDiv = document.getElementById('turn-div');
const startStopButton = document.getElementById('start-stop')
const logOut = document.getElementById('log-out');

let whoseTurn = null;
let gameIsRunning = false;

bowlDiv.style.display = 'none';
pickedDiv.style.visibility = 'hidden';

checkLogin();
checkGameIsRunning();

function checkLogin() {
    if (userId) {
        document.getElementById('log-in').style.display = 'none'
        document.getElementById('logged-in').style.display = 'flex';
        document.getElementById('username').textContent = userId;

    } else {

        document.getElementById('log-in').style.display = 'flex'
        document.getElementById('logged-in').style.display = 'none';
    }

}

function checkGameIsRunning() {
    if (gameIsRunning) {
        addForm.style.visibility = 'hidden';
        turnDiv.style.visibility = 'visible'
    } else {
        addForm.style.visibility = 'visible';
        turnDiv.style.visibility = 'hidden'
    }
};

startStopButton.addEventListener('click', (e) => {
    socket.emit('toggleRunningGame', !gameIsRunning);
    checkGameIsRunning();
})

socket.on('gameStateChanged', (newGameState) => {
    gameIsRunning = newGameState;
    startStopButton.textContent = gameIsRunning ? 'Stop Game' : 'Start Game';

    if (gameIsRunning) {
        startStopButton.classList.add('red')
        startStopButton.textContent = 'Stop game'
    } else {
        startStopButton.classList.remove('red')
        startStopButton.textContent = 'Start game'
    }
    checkGameIsRunning();
})

userInputForm.addEventListener('submit', (e) => {
    e.preventDefault();

    socket.emit('login', userInput.value)
    userId = userInput.value;
    localStorage.setItem('userId', userInput.value);
    checkLogin();
})

function showYourItem(item) {
    if (item) {
        pickedSpan.textContent = item;
    }
}

function setCurrentTurn(id) {
    turnSpan.textContent = id;
    whoseTurn = id;

    if (!whoseTurn) {
        whoseTurn = userId
        socket.emit('my turn', { userId })
    } else {
        turnDiv.style.display = 'block'
    }

    if (whoseTurn === userId) {
        takeTurn.style.display = 'none';
        pickedDiv.style.visibility = 'visible';
        pickOne.style.visibility = 'visible'

    } else {
        takeTurn.style.display = 'flex';
        pickedDiv.style.visibility = 'hidden';
        pickOne.style.visibility = 'hidden'
    }
}

function makeBowl(bowl) {
    const oldBowlList = document.querySelector('ul')
    const bowlList = document.createElement('ul');

    if (!Object.keys(bowl).length) {
        pickOne.style.display = 'none';
        itemsCount.textContent = "Your bowl is empty!"
        document.querySelector('img').src = 'https://www.pamperedchef.com/iceberg/com/product/100188-2-lg.jpg';
        startStopButton.style.visibility = 'hidden';
    } else {
        itemsCount.textContent = "Your bowl has this many items: " + Object.keys(bowl).length;
        pickOne.style.display = 'block';
        startStopButton.style.visibility = 'visible';
        document.querySelector('img').src = 'https://www.pamperedchef.com/iceberg/com/product/100188-lg.jpg';
    }

    Object.keys(bowl).forEach(item => {
        const div = document.createElement('div');

        div.textContent = item;

        bowlList.appendChild(div);
    });

    if (oldBowlList) {
        bowlDiv.replaceChild(bowlList, oldBowlList)
    } else {
        bowlDiv.appendChild(bowlList)
    }
}

socket.on('added to bowl', (bowl) => {
    makeBowl(bowl)
});

socket.on('cleared bowl', (bowl) => {
    makeBowl({})
});

socket.on('whose turn', (whoseTurn) => {
    setCurrentTurn(whoseTurn)
});

socket.on('toggle game', (isRunning) => {
    gameIsRunning = isRunning;
})
socket.on('bowlAccessed', ({ bowl, currentTurnUser, gameIsRunningServer }) => {
    makeBowl(bowl)
    setCurrentTurn(currentTurnUser)
    gameIsRunning = gameIsRunningServer;
    checkGameIsRunning()
});

socket.on('refreshed bowl', ({ bowl }) => {
    makeBowl(bowl)
});

socket.on('picked one', ({ removed, bowl }) => {
    showYourItem(removed)
    makeBowl(bowl)
});

addForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input.value !== '') {
        socket.emit('add to bowl', {
            item: input.value,
            userId,
        });
    }

    input.value = '';
})

pickOne.addEventListener('click', () => {
    socket.emit('pick one', { userId })
})

toggleButton.addEventListener('click', () => {
    const isHidden = bowlDiv.style.display;

    if (isHidden === 'none') {
        bowlDiv.style.display = 'block'
    } else {
        bowlDiv.style.display = 'none'
    }
})

refreshButton.addEventListener('click', () => {
    socket.emit('refresh bowl', { userId })
})

clearAllBowls.addEventListener('click', () => {
    socket.emit('clear bowl', { userId })
})

// myTurn.addEventListener('click', () => {
//     const isHidden = pickedDiv.style.visibility;

//     if (isHidden === 'hidden') {
//         pickedDiv.style.visibility = 'visible'
//     } else {
//         pickedDiv.style.visibility = 'hidden'
//     }
// })

takeTurn.addEventListener('click', () => {
    socket.emit('my turn', { userId })
})

logOut.addEventListener('click', () => {
    localStorage.clear();
    userId = null;
    checkLogin();
})
