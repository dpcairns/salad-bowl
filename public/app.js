var socket = io();

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
const myTurn = document.getElementById('toggle-my-turn');

bowlDiv.style.display = 'none';
pickedDiv.style.display = 'none';

function showYourItem(item) {
    if (item) {
        pickedDiv.style.display = 'block';

        pickedSpan.textContent = item;
    } else {
        pickedDiv.style.display = 'none';
    }
}

function makeBowl(bowl) {
    const oldBowlList = document.querySelector('ul')
    const bowlList = document.createElement('ul');


    if (!Object.keys(bowl).length) {
        pickOne.style.display = 'none';
        itemsCount.textContent = "Your bowl is empty!"
        document.querySelector('img').src = 'https://www.pamperedchef.com/iceberg/com/product/100188-2-lg.jpg';
    } else {
        itemsCount.textContent = "Your bowl has this many items: " + Object.keys(bowl).length;
        pickOne.style.display = 'block';
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
    console.log('added');
    makeBowl(bowl)
});

socket.on('cleared bowl', (bowl) => {
    console.log('cleared');
    makeBowl({})
});

socket.on('bowlAccessed', (bowl) => {
    makeBowl(bowl)
});

socket.on('refreshed bowl', ({ bowl }) => {
    console.log('refreshed', bowl);
    makeBowl(bowl)
});

socket.on('picked one', ({ removed, bowl }) => {
    console.log('removed', removed);
    showYourItem(removed)
    makeBowl(bowl)
});

addForm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('add to bowl', input.value)
})

pickOne.addEventListener('click', () => {
    socket.emit('pick one')
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
    socket.emit('refresh bowl')
})

clearAllBowls.addEventListener('click', () => {
    socket.emit('clear bowl')
})

myTurn.addEventListener('click', () => {
    const isHidden = pickedDiv.style.display;

    if (isHidden === 'none') {
        pickedDiv.style.display = 'block'
    } else {
        pickedDiv.style.display = 'none'
    }
})