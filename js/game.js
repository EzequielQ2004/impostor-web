// game.js - Logica principal del juego

function addPlayer() {
    const playerInput = document.getElementById('playerName');
    const playerName = playerInput.value.trim();

    if (playerName === '') {
        alert('Por favor, ingresa un nombre valido');
        return;
    }

    if (gameState.players.includes(playerName)) {
        alert('Este jugador ya existe');
        return;
    }

    gameState.players.push(playerName);
    playerInput.value = '';
    updatePlayerList();
    updateImpostorLimit();
}

function removePlayer(index) {
    gameState.players.splice(index, 1);
    updatePlayerList();
    updateImpostorLimit();
}

function startGame() {
    if (gameState.players.length < 3) {
        alert('Debe haber al menos 3 jugadores para jugar');
        showScreen('playerSetupScreen');
        return;
    }

    if (!gameState.category) {
        alert('Por favor, selecciona una categoria');
        showScreen('categorySetupScreen');
        return;
    }

    if (gameState.impostorCount >= gameState.players.length) {
        alert('No puede haber mas impostores que jugadores');
        showScreen('impostorSetupScreen');
        return;
    }

    prepareGame();
    showWordScreen();
}

function prepareGame() {
    gameState.currentPlayerIndex = 0;
    gameState.impostors = [];
    gameState.words = [];
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;

    const playersCount = gameState.players.length;
    const allIndexes = Array.from({ length: playersCount }, (_, i) => i);

    for (let i = allIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndexes[i], allIndexes[j]] = [allIndexes[j], allIndexes[i]];
    }

    gameState.impostors = allIndexes.slice(0, gameState.impostorCount);

    const categoryWords = [...categories[gameState.category]];

    for (let i = categoryWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categoryWords[i], categoryWords[j]] = [categoryWords[j], categoryWords[i]];
    }

    const normalWord = categoryWords[0];

    for (let i = 0; i < playersCount; i++) {
        if (gameState.impostors.includes(i)) {
            gameState.words[i] = 'IMPOSTOR';
        } else {
            gameState.words[i] = normalWord;
        }
    }

    gameState.playerOrder = Array.from({ length: playersCount }, (_, i) => i);
    for (let i = gameState.playerOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.playerOrder[i], gameState.playerOrder[j]] = [gameState.playerOrder[j], gameState.playerOrder[i]];
    }
}

function generatePlayerOrder() {
    if (gameState.playerOrder.length === 0) {
        const playersCount = gameState.players.length;
        gameState.playerOrder = Array.from({ length: playersCount }, (_, i) => i);

        for (let i = gameState.playerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameState.playerOrder[i], gameState.playerOrder[j]] = [gameState.playerOrder[j], gameState.playerOrder[i]];
        }
    }
}

function resetGame() {
    gameState.players = [];
    gameState.category = '';
    gameState.impostorCount = 1;
    gameState.impostors = [];
    gameState.words = [];
    gameState.currentPlayerIndex = 0;
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;

    document.getElementById('playerName').value = '';
    updatePlayerList();
    initializeCategories();
    showScreen('menuScreen');
}
