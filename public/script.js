// Initialize Firebase
const firebaseConfig = {
    // Your Firebase config here
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const gameRef = db.ref('game');
const playersRef = db.ref('players');

// Track button state
button.addEventListener('mousedown', () => {
    const myId = firebase.auth().currentUser.uid;
    playersRef.child(myId).set(true);
});

button.addEventListener('mouseup', () => {
    const myId = firebase.auth().currentUser.uid;
    playersRef.child(myId).remove();
});

button.addEventListener('click', () => {
    console.log('Button clicked');
    socket.emit('buttonPress');
});

// Listen for changes
playersRef.on('value', (snapshot) => {
    const players = snapshot.val() || {};
    const count = Object.keys(players).length;
    updateUI(count);
});

function updateUI(count) {
    playerCount.textContent = count;
    if (count === 2) {
        statusMessage.textContent = 'Hold the button! Opening vault...';
    } else if (count > 2) {
        statusMessage.textContent = 'Too many players pressing!';
    } else {
        statusMessage.textContent = 'Waiting for more players...';
    }
}

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