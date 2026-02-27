// ui.js - Funciones de interfaz de usuario

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showRulesScreen() {
    showScreen('rulesScreen');
}

function goToPlayerSetup() {
    showScreen('playerSetupScreen');
    document.getElementById('playerName').focus();
}

function goToCategorySetup() {
    if (gameState.players.length < 3) {
        alert('Debe haber al menos 3 jugadores para continuar.');
        return;
    }

    showScreen('categorySetupScreen');
}

function goToImpostorSetup() {
    if (!gameState.category) {
        alert('Por favor, selecciona una categoria.');
        return;
    }

    showScreen('impostorSetupScreen');
}

function updatePlayerList() {
    const playerListDiv = document.getElementById('playerList');

    if (gameState.players.length === 0) {
        playerListDiv.innerHTML = '<p style="text-align: center; color: #666;">No hay jugadores agregados</p>';
        return;
    }

    playerListDiv.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';

        const playerName = document.createElement('span');
        playerName.textContent = player;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Eliminar';
        removeBtn.className = 'btn btn-danger';
        removeBtn.style.padding = '6px 12px';
        removeBtn.style.fontSize = '14px';
        removeBtn.onclick = () => removePlayer(index);

        playerItem.appendChild(playerName);
        playerItem.appendChild(removeBtn);
        playerListDiv.appendChild(playerItem);
    });
}

function updateImpostorLimit() {
    const impostorCountSelect = document.getElementById('impostorCount');
    const currentImpostorCount = parseInt(impostorCountSelect.value, 10) || 1;
    const playerCount = gameState.players.length;

    let maxImpostors = 1;

    if (playerCount >= 5) {
        maxImpostors = 3;
    } else if (playerCount >= 4) {
        maxImpostors = 2;
    }

    impostorCountSelect.innerHTML = '';

    for (let i = 1; i <= maxImpostors; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? '1 impostor' : `${i} impostores`;
        impostorCountSelect.appendChild(option);
    }

    if (currentImpostorCount <= maxImpostors) {
        impostorCountSelect.value = String(currentImpostorCount);
    } else {
        impostorCountSelect.value = String(Math.min(2, maxImpostors));
    }

    gameState.impostorCount = parseInt(impostorCountSelect.value, 10);
}

function initializeCategories() {
    const categoryOptions = document.getElementById('categoryOptions');
    categoryOptions.innerHTML = '';

    for (const category in categories) {
        const option = document.createElement('div');
        option.className = 'category-option';
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        option.setAttribute('data-category', category);

        option.addEventListener('click', function () {
            document.querySelectorAll('.category-option').forEach((opt) => {
                opt.classList.remove('selected');
            });

            this.classList.add('selected');
            gameState.category = this.getAttribute('data-category');
        });

        categoryOptions.appendChild(option);
    }

    const firstOption = document.querySelector('.category-option');
    if (firstOption) {
        firstOption.classList.add('selected');
        gameState.category = firstOption.getAttribute('data-category');
    }

    updateImpostorLimit();

    const impostorCountSelect = document.getElementById('impostorCount');
    impostorCountSelect.addEventListener('change', function () {
        gameState.impostorCount = parseInt(this.value, 10);
    });

    gameState.impostorCount = parseInt(impostorCountSelect.value, 10);
}

function showWordScreen() {
    showScreen('wordScreen');
    resetWordScreen();
    showCurrentPlayerWord();
}

function resetWordScreen() {
    if (typeof revealTimer !== 'undefined' && revealTimer !== null) {
        clearTimeout(revealTimer);
        revealTimer = null;
    }
    document.getElementById('hiddenMessage').style.display = 'block';
    document.getElementById('wordDisplay').style.display = 'none';
    document.getElementById('nextPlayerBtn').style.display = 'none';
    document.getElementById('finishWordsBtn').style.display = 'none';
}

function showCurrentPlayerWord() {
    const playerName = gameState.players[gameState.currentPlayerIndex];
    const word = gameState.words[gameState.currentPlayerIndex];

    document.getElementById('currentPlayerName').textContent = `Turno de: ${playerName}`;
    document.getElementById('displayPlayerName').textContent = playerName;
    document.getElementById('wordText').textContent = word;

    const impostorIndicator = document.getElementById('impostorIndicator');
    if (word === 'IMPOSTOR') {
        impostorIndicator.innerHTML = '<div class="impostor-label">Eres el impostor</div>';
    } else {
        impostorIndicator.innerHTML = '';
    }
}

let revealTimer = null;

function revealWord() {
    document.getElementById('hiddenMessage').style.display = 'none';
    document.getElementById('wordDisplay').style.display = 'flex';

    revealTimer = setTimeout(() => {
        if (gameState.currentPlayerIndex < gameState.players.length - 1) {
            document.getElementById('nextPlayerBtn').style.display = 'inline-block';
        } else {
            document.getElementById('finishWordsBtn').style.display = 'inline-block';
        }
    }, 3000);
}

function showNextPlayerWord() {
    gameState.currentPlayerIndex++;

    if (gameState.currentPlayerIndex < gameState.players.length) {
        resetWordScreen();
        showCurrentPlayerWord();
    }
}

function showOrderScreen() {
    generatePlayerOrder();
    displayOrder();
    showScreen('orderScreen');
}

function displayOrder() {
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';

    gameState.playerOrder.forEach((playerIndex, orderIndex) => {
        const playerName = gameState.players[playerIndex];
        const isImpostor = gameState.impostors.includes(playerIndex);
        const playerWord = gameState.words[playerIndex] || '';

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        if (gameState.secretsRevealed) {
            orderItem.innerHTML = `
                <div class="order-number">${orderIndex + 1}</div>
                <div>
                    ${playerName}
                    ${isImpostor ? '<span style="color:#ff5722; margin-left:8px;">(Impostor)</span>' : ''}
                    <div style="font-size:14px; color:#4fc3f7; margin-top:6px;">Palabra: <strong style="color:#ffd54f;">${playerWord}</strong></div>
                </div>
            `;
        } else {
            orderItem.innerHTML = `
                <div class="order-number">${orderIndex + 1}</div>
                <div>${playerName}</div>
            `;
        }

        orderList.appendChild(orderItem);
    });
}

function revealSecrets() {
    gameState.secretsRevealed = true;
    displayOrder();
}
