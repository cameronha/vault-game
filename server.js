const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));

// Game state
let gameState = {
    playersPressed: new Set(),
    timerRunning: false,
    startTime: null,
    requiredDuration: 10000, // 10 seconds in milliseconds
    requiredPlayers: 2
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('buttonPress', () => {
        gameState.playersPressed.add(socket.id);
        checkGameState();
    });

    socket.on('buttonRelease', () => {
        gameState.playersPressed.delete(socket.id);
        resetGame();
    });

    socket.on('disconnect', () => {
        gameState.playersPressed.delete(socket.id);
        resetGame();
        console.log('User disconnected:', socket.id);
    });

    function checkGameState() {
        const pressedCount = gameState.playersPressed.size;
        io.emit('playerCount', pressedCount);

        if (pressedCount === gameState.requiredPlayers && !gameState.timerRunning) {
            gameState.timerRunning = true;
            gameState.startTime = Date.now();
            startTimer();
        }
    }

    function startTimer() {
        const interval = setInterval(() => {
            if (!gameState.timerRunning) {
                clearInterval(interval);
                return;
            }

            const elapsed = Date.now() - gameState.startTime;
            const remaining = Math.max(0, (gameState.requiredDuration - elapsed) / 1000);
            
            io.emit('timerUpdate', remaining.toFixed(1));

            if (elapsed >= gameState.requiredDuration) {
                io.emit('vaultOpened');
                resetGame();
                clearInterval(interval);
            }
        }, 100);
    }

    function resetGame() {
        if (gameState.playersPressed.size !== gameState.requiredPlayers) {
            gameState.timerRunning = false;
            gameState.startTime = null;
            io.emit('timerReset');
        }
    }
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 