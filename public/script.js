const socket = io();
const button = document.getElementById('pressButton');
const playerCount = document.getElementById('player-count');
const timer = document.getElementById('timer');
const statusMessage = document.getElementById('status-message');

let isPressed = false;

button.addEventListener('mousedown', handlePress);
button.addEventListener('touchstart', handlePress);
button.addEventListener('mouseup', handleRelease);
button.addEventListener('touchend', handleRelease);
button.addEventListener('mouseleave', handleRelease);

function handlePress(e) {
    e.preventDefault();
    if (!isPressed) {
        isPressed = true;
        button.style.transform = 'scale(0.95)';
        socket.emit('buttonPress');
    }
}

function handleRelease(e) {
    e.preventDefault();
    if (isPressed) {
        isPressed = false;
        button.style.transform = 'scale(1)';
        socket.emit('buttonRelease');
    }
}

socket.on('playerCount', (count) => {
    playerCount.textContent = count;
    if (count === 2) {
        statusMessage.textContent = 'Hold the button! Opening vault...';
    } else if (count > 2) {
        statusMessage.textContent = 'Too many players pressing!';
    } else {
        statusMessage.textContent = 'Waiting for more players...';
    }
});

socket.on('timerUpdate', (timeLeft) => {
    timer.textContent = timeLeft;
});

socket.on('timerReset', () => {
    timer.textContent = '10.0';
});

socket.on('vaultOpened', () => {
    statusMessage.textContent = '🎉 Vault opened successfully! 🎉';
    button.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
        button.style.backgroundColor = '#003366';
        statusMessage.textContent = 'Wait for other players to join...';
    }, 3000);
}); 