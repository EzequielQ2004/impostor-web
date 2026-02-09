// game.js - Lógica principal del juego

// Función para agregar un jugador
function addPlayer() {
    const playerInput = document.getElementById('playerName');
    const playerName = playerInput.value.trim();
    
    if (playerName === '') {
        alert('Por favor, ingresa un nombre válido');
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

// Función para eliminar un jugador
function removePlayer(index) {
    gameState.players.splice(index, 1);
    updatePlayerList();
    updateImpostorLimit();
}

// Función para iniciar el juego
function startGame() {
    // Validar que haya al menos 3 jugadores
    if (gameState.players.length < 3) {
        alert('Debe haber al menos 3 jugadores para jugar');
        return;
    }
    
    // Validar que la categoría esté seleccionada
    if (!gameState.category) {
        alert('Por favor, selecciona una categoría');
        return;
    }
    
    // Validar que no haya más impostores que lo permitido
    if (gameState.impostorCount >= gameState.players.length) {
        alert('No puede haber más impostores que jugadores');
        return;
    }
    
    // Preparar el juego
    prepareGame();
    
    // Mostrar la pantalla de palabras
    showWordScreen();
}

// Función para preparar el juego
function prepareGame() {
    // Reiniciar estado del juego
    gameState.currentPlayerIndex = 0;
    gameState.impostors = [];
    gameState.words = [];
    gameState.playerOrder = [];
    
    // Seleccionar impostores aleatorios
    const playersCount = gameState.players.length;
    const allIndexes = Array.from({length: playersCount}, (_, i) => i);
    
    // Mezclar índices
    for (let i = allIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndexes[i], allIndexes[j]] = [allIndexes[j], allIndexes[i]];
    }
    
    // Tomar los primeros N índices como impostores
    gameState.impostors = allIndexes.slice(0, gameState.impostorCount);
    
    // Seleccionar palabras para la categoría
    const categoryWords = [...categories[gameState.category]];
    
    // Mezclar palabras
    for (let i = categoryWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categoryWords[i], categoryWords[j]] = [categoryWords[j], categoryWords[i]];
    }
    
    // Asignar palabras a los jugadores
    const normalWord = categoryWords[0];
    
    for (let i = 0; i < playersCount; i++) {
        if (gameState.impostors.includes(i)) {
            // El impostor recibe una palabra diferente
            gameState.words[i] = 'IMPOSTOR';
        } else {
            // Los jugadores normales reciben la misma palabra
            gameState.words[i] = normalWord;
        }
    }
    
    // Crear orden aleatorio para hablar
    gameState.playerOrder = [...allIndexes];
}

// Función para generar el orden de los jugadores
function generatePlayerOrder() {
    // Mezclar el orden si aún no está generado
    if (gameState.playerOrder.length === 0) {
        const playersCount = gameState.players.length;
        gameState.playerOrder = Array.from({length: playersCount}, (_, i) => i);
        
        // Mezclar el orden
        for (let i = gameState.playerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameState.playerOrder[i], gameState.playerOrder[j]] = [gameState.playerOrder[j], gameState.playerOrder[i]];
        }
    }
}

// Función para reiniciar el juego
function resetGame() {
    // Limpiar el estado
    gameState.players = [];
    gameState.category = '';
    gameState.impostorCount = 1;
    gameState.impostors = [];
    gameState.words = [];
    gameState.currentPlayerIndex = 0;
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;
    
    // Reiniciar la UI
    updatePlayerList();
    initializeCategories();
    
    // Volver a la pantalla de configuración
    showScreen('setupScreen');
}
