var socket = io();

function makeBowl(bowl) {
    const bowlDiv = document.getElementById('bowl');
    const oldBowlList = document.querySelector('ul')
    const bowlList = document.createElement('ul')
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

socket.on('bowlAccessed', (bowl) => {
    console.log('accessed', bowl);
    makeBowl(bowl)
});

socket.on('picked one', ({ removed, bowl }) => {
    console.log('removed', removed);

    makeBowl(bowl)
});

const input = document.getElementById('add-input');
const addForm = document.getElementById('add-form')
const refreshButton = document.getElementById('refresh-button')
const pickOne = document.getElementById('pick-one')

addForm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('add to bowl', input.value)
})

pickOne.addEventListener('click', () => {
    socket.emit('pick one')
})