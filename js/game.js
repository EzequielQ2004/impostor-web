// game.js - Logica principal del juego

function addPlayer() {
    const playerInput = document.getElementById('playerName');
    const rawName = playerInput.value.trim();
    const playerName = sanitizePlayerName(rawName);

    if (playerName === '') {
        alert('Por favor, ingresa un nombre valido');
        return;
    }

    // Validar longitud máxima
    if (rawName.length > 50) {
        alert('El nombre es demasiado largo (maximo 50 caracteres)');
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

    // Validar palabras personalizadas si se usa el modo personalizado
    if (gameState.category === 'personalizado') {
        alert('Por favor, crea y selecciona una categoria personalizada desde la lista de categorias guardadas, o selecciona una categoria predefinida.');
        showScreen('categorySetupScreen');
        return;
    }

    // Validar que existe la categoría (incluyendo personalizadas)
    const isCustomCategory = gameState.category.startsWith('custom_');
    if (isCustomCategory) {
        // Recargar desde localStorage por si acaso
        loadCustomCategories();
        if (!customCategories[gameState.category]) {
            alert('La categoria seleccionada no existe. Por favor, selecciona otra.');
            showScreen('categorySetupScreen');
            return;
        }

        // Validar que las palabras cercanas están definidas si el modo está activo
        if (gameState.closeWordCount > 0) {
            const customCat = customCategories[gameState.category];
            const hasCloseWords = customCat.words.some(w => w.cercana && w.cercana !== w.normal);

            if (!hasCloseWords) {
                alert('Advertencia: La categoria personalizada seleccionada no tiene palabras cercanas definidas. El modo "Palabra cercana" se ha desactivado automaticamente.');
                gameState.closeWordCount = 0;
                document.getElementById('closeWordCount').value = '0';
            }
        }
    }

    if (gameState.impostorCount >= gameState.players.length) {
        alert('No puede haber mas impostores que jugadores');
        showScreen('impostorSetupScreen');
        return;
    }

    // Validar que impostores + palabras cercanas no ocupen a todos
    if (gameState.impostorCount + gameState.closeWordCount >= gameState.players.length) {
        alert('La suma de impostores y jugadores con palabra cercana debe ser menor al total de jugadores (debe quedar al menos 1 normal)');
        showScreen('impostorSetupScreen');
        return;
    }

    prepareGame();
    showWordScreen();
}

function prepareGame() {
    gameState.currentPlayerIndex = 0;
    gameState.impostors = [];
    gameState.closeWords = [];
    gameState.words = [];
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;

    const playersCount = gameState.players.length;
    const allIndexes = Array.from({ length: playersCount }, (_, i) => i);

    // Mezclar índices para asignación aleatoria
    for (let i = allIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndexes[i], allIndexes[j]] = [allIndexes[j], allIndexes[i]];
    }

    // Asignar impostores
    gameState.impostors = allIndexes.slice(0, gameState.impostorCount);

    // Asignar jugadores con palabra cercana (de los que quedan)
    const remainingIndexes = allIndexes.slice(gameState.impostorCount);
    gameState.closeWords = remainingIndexes.slice(0, gameState.closeWordCount);

    // Seleccionar palabras
    let normalWord, closeWord;

    if (gameState.category.startsWith('custom_')) {
        // Usar categoría personalizada desde localStorage
        const customCat = customCategories[gameState.category];
        if (!customCat || customCat.words.length === 0) {
            alert('Error: La categoría personalizada no tiene palabras');
            return;
        }
        // Seleccionar un par aleatorio de la categoría personalizada
        const randomIndex = Math.floor(Math.random() * customCat.words.length);
        const selectedPair = customCat.words[randomIndex];
        normalWord = selectedPair.normal;
        closeWord = selectedPair.cercana || normalWord;
    } else {
        // Usar categoría predefinida
        const categoryPairs = [...categories[gameState.category]];
        for (let i = categoryPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [categoryPairs[i], categoryPairs[j]] = [categoryPairs[j], categoryPairs[i]];
        }
        const selectedPair = categoryPairs[0];
        normalWord = selectedPair.normal;
        closeWord = selectedPair.cercana;
    }

    // Asignar palabras a cada jugador
    for (let i = 0; i < playersCount; i++) {
        if (gameState.impostors.includes(i)) {
            gameState.words[i] = 'IMPOSTOR';
        } else if (gameState.closeWords.includes(i)) {
            gameState.words[i] = closeWord;
        } else {
            gameState.words[i] = normalWord;
        }
    }

    // Generar orden aleatorio
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

function playAgain() {
    gameState.currentPlayerIndex = 0;
    gameState.impostors = [];
    gameState.closeWords = [];
    gameState.words = [];
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;

    // Ensure the player list is up to date visually, although it should be already
    updatePlayerList();

    // Ensure the saved category visually selected
    if (gameState.category) {
        document.querySelectorAll('.category-option').forEach((opt) => {
            if (opt.getAttribute('data-category') === gameState.category) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // Ensure impostor limit is up to date based on players
    const previousCount = gameState.impostorCount;
    updateImpostorLimit();
    const impostorSelect = document.getElementById('impostorCount');
    if ([...impostorSelect.options].some(opt => opt.value === String(previousCount))) {
        impostorSelect.value = String(previousCount);
        gameState.impostorCount = previousCount;
    }

    // Preserve close word count if still valid
    const previousCloseCount = gameState.closeWordCount;
    updateCloseWordLimit();
    const closeWordSelect = document.getElementById('closeWordCount');
    if ([...closeWordSelect.options].some(opt => opt.value === String(previousCloseCount))) {
        closeWordSelect.value = String(previousCloseCount);
        gameState.closeWordCount = previousCloseCount;
    }

    goToPlayerSetup();
}

function resetGame() {
    gameState.players = [];
    gameState.category = '';
    gameState.impostorCount = 1;
    gameState.closeWordCount = 0;
    gameState.impostors = [];
    gameState.closeWords = [];
    gameState.words = [];
    gameState.currentPlayerIndex = 0;
    gameState.playerOrder = [];
    gameState.secretsRevealed = false;

    document.getElementById('playerName').value = '';
    updatePlayerList();
    initializeCategories();
    showScreen('menuScreen');
}
