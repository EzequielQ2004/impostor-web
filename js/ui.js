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
    updateCloseWordLimit();
}

function updateCloseWordLimit() {
    const closeWordCountSelect = document.getElementById('closeWordCount');
    if (!closeWordCountSelect) return;

    const currentCloseWordCount = parseInt(closeWordCountSelect.value, 10) || 0;
    const playerCount = gameState.players.length;
    const impostorCount = gameState.impostorCount;

    // Máximo de jugadores con palabra cercana: total - impostores - 1 (debe quedar al menos 1 normal)
    const maxCloseWords = Math.max(0, playerCount - impostorCount - 1);

    closeWordCountSelect.innerHTML = '';

    const option0 = document.createElement('option');
    option0.value = 0;
    option0.textContent = '0 (solo impostores)';
    closeWordCountSelect.appendChild(option0);

    for (let i = 1; i <= maxCloseWords && i <= 3; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? '1 jugador' : `${i} jugadores`;
        closeWordCountSelect.appendChild(option);
    }

    if (currentCloseWordCount <= maxCloseWords) {
        closeWordCountSelect.value = String(currentCloseWordCount);
    } else {
        closeWordCountSelect.value = String(Math.min(2, maxCloseWords));
    }

    gameState.closeWordCount = parseInt(closeWordCountSelect.value, 10);
}

function initializeCategories() {
    // Cargar categorías guardadas primero
    loadCustomCategories();

    // Renderizar opciones de categoría
    renderCategoryOptions();

    updateImpostorLimit();
    updateCloseWordLimit();

    const impostorCountSelect = document.getElementById('impostorCount');
    impostorCountSelect.addEventListener('change', function () {
        gameState.impostorCount = parseInt(this.value, 10);
        updateCloseWordLimit();
    });

    const closeWordCountSelect = document.getElementById('closeWordCount');
    closeWordCountSelect.addEventListener('change', function () {
        gameState.closeWordCount = parseInt(this.value, 10);
    });

    gameState.impostorCount = parseInt(impostorCountSelect.value, 10);
    gameState.closeWordCount = parseInt(closeWordCountSelect.value, 10);
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
    const isImpostor = gameState.impostors.includes(gameState.currentPlayerIndex);
    const isCloseWord = gameState.closeWords.includes(gameState.currentPlayerIndex);

    if (isImpostor) {
        impostorIndicator.innerHTML = '<div class="impostor-label">Eres el impostor</div>';
    } else if (isCloseWord) {
        impostorIndicator.innerHTML = '<div class="close-word-label">Tienes una palabra cercana</div>';
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
        const isCloseWord = gameState.closeWords.includes(playerIndex);
        const playerWord = gameState.words[playerIndex] || '';

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        // Número de orden
        const orderNum = createSafeElement('div', {
            className: 'order-number',
            textContent: orderIndex + 1
        });
        orderItem.appendChild(orderNum);

        // Información del jugador
        const infoDiv = document.createElement('div');

        if (gameState.secretsRevealed) {
            // Nombre del jugador
            const nameText = document.createTextNode(playerName);
            infoDiv.appendChild(nameText);

            // Rol (Impostor o Palabra cercana)
            if (isImpostor) {
                const roleSpan = createSafeElement('span', {
                    textContent: ' (Impostor)'
                });
                roleSpan.style.color = '#ff5722';
                roleSpan.style.marginLeft = '8px';
                infoDiv.appendChild(roleSpan);
            } else if (isCloseWord) {
                const roleSpan = createSafeElement('span', {
                    textContent: ' (Palabra cercana)'
                });
                roleSpan.style.color = '#ff9800';
                roleSpan.style.marginLeft = '8px';
                infoDiv.appendChild(roleSpan);
            }

            // Palabra
            const wordDiv = createSafeElement('div', {
                textContent: `Palabra: ${playerWord}`
            });
            wordDiv.style.fontSize = '14px';
            wordDiv.style.color = '#4fc3f7';
            wordDiv.style.marginTop = '6px';
            wordDiv.querySelector = () => null; // Evitar que se apliquen estilos fuertes
            infoDiv.appendChild(wordDiv);
        } else {
            // Solo nombre cuando no se revelan secretos
            const nameSpan = createSafeElement('span', {
                textContent: playerName
            });
            infoDiv.appendChild(nameSpan);
        }

        orderItem.appendChild(infoDiv);
        orderList.appendChild(orderItem);
    });
}

function revealSecrets() {
    gameState.secretsRevealed = true;
    displayOrder();
}

// Funciones del Modal de Información
function showInfoModal(title, contentHtml) {
    // El título siempre se escapa para seguridad
    document.getElementById('modalTitle').textContent = title;
    // El contenido HTML es controlado por nosotros (strings literales en el código)
    // pero podríamos sanitizarlo también si fuera necesario
    document.getElementById('modalContent').innerHTML = contentHtml;
    document.getElementById('infoModal').style.display = 'flex';
}

function closeInfoModal() {
    document.getElementById('infoModal').style.display = 'none';
}

function showImpostorInfo() {
    showInfoModal('¿Qué es un Impostor?', `
        <p>El <strong>Impostor</strong> es un jugador que <strong>no recibe ninguna palabra</strong>. Su objetivo es:</p>
        <ul>
            <li>Escuchar las pistas de los demás jugadores</li>
            <li>Improvisar pistas que parezcan coherentes</li>
            <li>No ser descubierto durante la votación</li>
        </ul>
        <p style="margin-top: 15px;">Si el impostor engaña al grupo y no es descubierto, ¡gana la partida!</p>
    `);
}

function showCloseWordInfo() {
    showInfoModal('¿Qué es Palabra Cercana?', `
        <p>El modo <strong style="color: #ff9800;">Palabra Cercana</strong> añade jugadores con una palabra <strong>similar pero no idéntica</strong> a la principal.</p>
        <p style="margin-top: 15px;"><strong>Ejemplo:</strong></p>
        <ul>
            <li>Mayoría recibe: <strong>pizza</strong></li>
            <li>Algunos reciben: <strong>empanada</strong></li>
            <li>Impostores no reciben nada</li>
        </ul>
        <p style="margin-top: 15px;">Esto crea confusión porque todos creen tener la misma palabra, pero algunas pistas no encajan perfectamente. ¡Más divertido y caótico!</p>
    `);
}

function showCustomWordsInfo() {
    showInfoModal('Modo Personalizado - Categorias', `
        <p>El modo <strong style="color: #3ab5ff;">Personalizado</strong> te permite crear tus propias categorias con palabras personalizadas.</p>
        <p style="margin-top: 15px;"><strong>Como funciona:</strong></p>
        <ul>
            <li>Crea una categoria con un nombre (ej: "Personajes de Marvel")</li>
            <li>Agrega multiples pares de palabras</li>
            <li>La palabra principal es la que recibe la mayoria</li>
            <li>La palabra cercana es opcional y similar a la principal</li>
            <li>Las categorias se guardan automaticamente en tu dispositivo</li>
        </ul>
        <p style="margin-top: 15px;">Perfecto para jugar con temas especificos que conozcas con tus amigos!</p>
    `);
}

// ============ FUNCIONES DE CATEGORIAS PERSONALIZADAS ============

// Cargar categorías desde localStorage
function loadCustomCategories() {
    // Cargar categorías desde localStorage con sanitización
    const saved = localStorage.getItem('impostorCustomCategories');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            customCategories = sanitizeAllCategories(parsed);
        } catch (e) {
            console.error('Error loading custom categories:', e);
            customCategories = {};
        }
    }
}

// Guardar categorías en localStorage con validación de tamaño
function saveCustomCategoriesToStorage() {
    // Sanitizar antes de guardar
    const sanitized = sanitizeAllCategories(customCategories);

    // Validar tamaño
    if (!isStorageSafe(sanitized)) {
        alert('Las categorías son demasiado grandes. Elimina algunas categorías o palabras.');
        return false;
    }

    try {
        localStorage.setItem('impostorCustomCategories', JSON.stringify(sanitized));
        // Actualizar el objeto en memoria con datos sanitizados
        customCategories = sanitized;
        return true;
    } catch (e) {
        console.error('Error saving custom categories:', e);
        alert('No se pudieron guardar las categorías. El almacenamiento puede estar lleno.');
        return false;
    }
}

// Agregar palabra a la categoría temporal
function addWordToCategory() {
    const normalInput = document.getElementById('newWordNormal');
    const closeInput = document.getElementById('newWordClose');
    const rawNormal = normalInput.value.trim();
    const rawCercana = closeInput.value.trim();

    // Validar y sanitizar
    const normal = escapeHtml(rawNormal.substring(0, 100));
    const cercana = rawCercana ? escapeHtml(rawCercana.substring(0, 100)) : '';

    if (!normal) {
        alert('Por favor, ingresa una palabra principal');
        return;
    }

    // Validar longitud original
    if (rawNormal.length > 100) {
        alert('La palabra es demasiado larga (máximo 100 caracteres)');
        return;
    }

    // Verificar que no exista ya (comparación case-insensitive)
    const exists = tempCustomCategory.words.some(w =>
        w.normal.toLowerCase() === normal.toLowerCase()
    );
    if (exists) {
        alert('Esta palabra ya existe en la categoria');
        return;
    }

    tempCustomCategory.words.push({
        normal: normal,
        cercana: cercana || normal // Si no hay cercana, usa la normal
    });

    normalInput.value = '';
    closeInput.value = '';
    normalInput.focus();

    updateCustomWordsList();
}

// Actualizar la lista visual de palabras temporales
function updateCustomWordsList() {
    const container = document.getElementById('customWordsList');

    if (tempCustomCategory.words.length === 0) {
        container.innerHTML = '<p style="color: #9dd6ff; text-align: center;">No hay palabras agregadas aun</p>';
        return;
    }

    container.innerHTML = '';
    tempCustomCategory.words.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'custom-word-item';

        const hasCloseWord = word.cercana && word.cercana !== word.normal;

        // Crear elementos de forma segura
        const wordPairDiv = document.createElement('div');
        wordPairDiv.className = 'word-pair';

        const mainSpan = createSafeElement('span', {
            className: 'word-main',
            textContent: word.normal
        });
        wordPairDiv.appendChild(mainSpan);

        if (hasCloseWord) {
            const closeSpan = createSafeElement('span', {
                className: 'word-close',
                textContent: word.cercana
            });
            wordPairDiv.appendChild(closeSpan);
        }

        const deleteBtn = createSafeElement('button', {
            className: 'btn btn-danger btn-small',
            textContent: 'Eliminar'
        });
        deleteBtn.onclick = () => removeWordFromCategory(index);

        item.appendChild(wordPairDiv);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}

// Eliminar palabra de la categoría temporal
function removeWordFromCategory(index) {
    tempCustomCategory.words.splice(index, 1);
    updateCustomWordsList();
}

// Guardar categoría completa
function saveCustomCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Por favor, ingresa un nombre para la categoria');
        return;
    }

    if (tempCustomCategory.words.length === 0) {
        alert('Agrega al menos una palabra a la categoria');
        return;
    }

    // Crear ID único basado en nombre
    const categoryId = 'custom_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Guardar en el objeto de categorías personalizadas
    customCategories[categoryId] = {
        name: name,
        words: [...tempCustomCategory.words]
    };

    // Guardar en localStorage
    saveCustomCategoriesToStorage();

    // Limpiar formulario
    clearCategoryForm();

    // Actualizar UI
    renderSavedCategories();
    renderCategoryOptions();

    alert(`Categoria "${name}" guardada exitosamente!`);
}

// Limpiar formulario de categoría
function clearCategoryForm() {
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newWordNormal').value = '';
    document.getElementById('newWordClose').value = '';
    tempCustomCategory = {
        name: '',
        words: []
    };
    updateCustomWordsList();
}

// Eliminar categoría guardada
function deleteCustomCategory(categoryId) {
    if (confirm('¿Estas seguro de que quieres eliminar esta categoria?')) {
        delete customCategories[categoryId];
        saveCustomCategoriesToStorage();
        renderSavedCategories();
        renderCategoryOptions();

        // Si la categoría eliminada estaba seleccionada, resetear
        if (gameState.category === categoryId) {
            gameState.category = '';
            const firstOption = document.querySelector('.category-option');
            if (firstOption) {
                firstOption.classList.add('selected');
                gameState.category = firstOption.getAttribute('data-category');
            }
        }
    }
}

// Renderizar categorías guardadas en la lista
function renderSavedCategories() {
    const container = document.getElementById('savedCategoriesList');
    const categoryIds = Object.keys(customCategories);

    if (categoryIds.length === 0) {
        container.innerHTML = '<p style="color: #9dd6ff; text-align: center;">No tienes categorias guardadas</p>';
        return;
    }

    container.innerHTML = '';
    categoryIds.forEach(id => {
        const cat = customCategories[id];
        const item = document.createElement('div');
        item.className = 'saved-category-item';

        // Crear elementos de forma segura
        const nameSpan = createSafeElement('span', {
            className: 'category-name',
            textContent: cat.name
        });
        const countSpan = createSafeElement('span', {
            className: 'word-count',
            textContent: `(${cat.words.length} palabras)`
        });

        const infoDiv = document.createElement('div');
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(countSpan);

        // Botones - usar onclick seguro
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'category-actions';

        const useBtn = createSafeElement('button', {
            className: 'btn btn-success btn-small',
            textContent: 'Usar'
        });
        useBtn.onclick = () => selectCustomCategory(id);

        const editBtn = createSafeElement('button', {
            className: 'btn btn-small',
            attributes: { style: 'background-color: #ff9800;' },
            textContent: 'Editar'
        });
        editBtn.onclick = () => editCustomCategory(id);

        const deleteBtn = createSafeElement('button', {
            className: 'btn btn-danger btn-small',
            textContent: 'Eliminar'
        });
        deleteBtn.onclick = () => deleteCustomCategory(id);

        actionsDiv.appendChild(useBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(infoDiv);
        item.appendChild(actionsDiv);
        container.appendChild(item);
    });
}

// Variable para saber si estamos editando
let editingCategoryId = null;

// Mostrar formulario para crear nueva categoría
function showCreateCategoryForm() {
    editingCategoryId = null;
    document.getElementById('categoryFormTitle').textContent = 'Crear Nueva Categoria';
    document.getElementById('createCategoryButtonSection').style.display = 'none';
    document.getElementById('createCategoryForm').style.display = 'block';
    clearCategoryForm();
}

// Mostrar formulario para editar categoría existente
function editCustomCategory(categoryId) {
    const cat = customCategories[categoryId];
    if (!cat) return;

    editingCategoryId = categoryId;
    // Usar textContent para evitar XSS
    document.getElementById('categoryFormTitle').textContent = `Editar: ${cat.name}`;
    document.getElementById('createCategoryButtonSection').style.display = 'none';
    document.getElementById('createCategoryForm').style.display = 'block';

    // Cargar datos de la categoría
    document.getElementById('newCategoryName').value = cat.name;
    tempCustomCategory = {
        name: cat.name,
        words: [...cat.words]
    };
    updateCustomWordsList();
}

// Cancelar crear/editar y volver a la lista
function cancelEditCategory() {
    document.getElementById('createCategoryForm').style.display = 'none';
    document.getElementById('createCategoryButtonSection').style.display = 'block';
    clearCategoryForm();
    editingCategoryId = null;
}

// Guardar categoría (nueva o editada)
function saveCustomCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const rawName = nameInput.value.trim();
    const name = escapeHtml(rawName.substring(0, 100)); // Limitar y sanitizar

    if (!name) {
        alert('Por favor, ingresa un nombre para la categoria');
        return;
    }

    if (tempCustomCategory.words.length === 0) {
        alert('Agrega al menos una palabra a la categoria');
        return;
    }

    // Sanitizar todas las palabras antes de guardar
    const sanitizedWords = tempCustomCategory.words.map(w => ({
        normal: escapeHtml(w.normal.substring(0, 100)),
        cercana: escapeHtml((w.cercana || w.normal).substring(0, 100))
    }));

    if (editingCategoryId) {
        // Actualizar categoría existente
        customCategories[editingCategoryId] = {
            name: name,
            words: sanitizedWords
        };
        alert(`Categoria "${name}" actualizada exitosamente!`);
    } else {
        // Crear nueva categoría
        const categoryId = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        customCategories[categoryId] = {
            name: name,
            words: sanitizedWords
        };
        alert(`Categoria "${name}" guardada exitosamente!`);
    }

    // Guardar en localStorage
    saveCustomCategoriesToStorage();

    // Limpiar y volver a la vista de lista
    cancelEditCategory();

    // Actualizar UI
    renderSavedCategories();
    renderCategoryOptions();
}

// Seleccionar una categoría personalizada para jugar
function selectCustomCategory(categoryId) {
    gameState.category = categoryId;

    // Actualizar UI
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-category') === categoryId) {
            opt.classList.add('selected');
        }
    });

    // Ocultar formulario si está visible
    cancelEditCategory();

    // Usar textContent para evitar XSS en el mensaje
    const catName = customCategories[categoryId].name;
    alert(`Categoria "${catName}" seleccionada!`);
}

// Renderizar todas las opciones de categoría (predefinidas + personalizadas)
function renderCategoryOptions() {
    const categoryOptions = document.getElementById('categoryOptions');
    categoryOptions.innerHTML = '';

    // Agregar categorías predefinidas
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
            toggleCustomCategorySection();
        });

        categoryOptions.appendChild(option);
    }

    // Agregar separador visual si hay categorías personalizadas
    if (Object.keys(customCategories).length > 0) {
        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.height = '1px';
        separator.style.backgroundColor = 'rgba(255,255,255,0.2)';
        separator.style.margin = '10px 0';
        categoryOptions.appendChild(separator);

        // Agregar categorías personalizadas guardadas
        for (const id in customCategories) {
            const option = document.createElement('div');
            option.className = 'category-option custom-category';
            option.textContent = customCategories[id].name;
            option.setAttribute('data-category', id);
            option.style.backgroundColor = '#2d4a7c';
            option.style.borderLeft = '3px solid #3ab5ff';

            option.addEventListener('click', function () {
                document.querySelectorAll('.category-option').forEach((opt) => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                gameState.category = this.getAttribute('data-category');
                toggleCustomCategorySection();
            });

            categoryOptions.appendChild(option);
        }
    }

    // Agregar opción "+ Crear Nueva" al final
    const createOption = document.createElement('div');
    createOption.className = 'category-option';
    createOption.textContent = '+ Crear Nueva';
    createOption.setAttribute('data-category', 'personalizado');
    createOption.style.backgroundColor = '#3a5a9c';
    createOption.style.fontWeight = 'bold';

    createOption.addEventListener('click', function () {
        document.querySelectorAll('.category-option').forEach((opt) => {
            opt.classList.remove('selected');
        });
        this.classList.add('selected');
        gameState.category = 'personalizado';
        toggleCustomCategorySection();
    });

    categoryOptions.appendChild(createOption);

    // Seleccionar primera opción por defecto si no hay ninguna seleccionada
    if (!gameState.category) {
        const firstOption = document.querySelector('.category-option');
        if (firstOption && firstOption.getAttribute('data-category') !== 'personalizado') {
            firstOption.classList.add('selected');
            gameState.category = firstOption.getAttribute('data-category');
        }
    } else {
        // Reseleccionar la categoría actual
        const currentOption = document.querySelector(`[data-category="${gameState.category}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }
}

// Mostrar/ocultar sección de categoría personalizada
function toggleCustomCategorySection() {
    const section = document.getElementById('customCategorySection');
    const isCreatingNew = gameState.category === 'personalizado';

    if (isCreatingNew) {
        section.style.display = 'block';
        renderSavedCategories();
        // Asegurarse de que el formulario esté oculto inicialmente y se vea el botón
        document.getElementById('createCategoryForm').style.display = 'none';
        document.getElementById('createCategoryButtonSection').style.display = 'block';
        cancelEditCategory(); // Resetear estado
    } else {
        section.style.display = 'none';
        cancelEditCategory(); // Limpiar estado al salir
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target === modal) {
        closeInfoModal();
    }

    // Cerrar modal de categorías móvil al hacer clic fuera
    const mobileModal = document.getElementById('mobileCategoryModal');
    if (event.target === mobileModal) {
        closeMobileCategoryModal();
    }
});

// ============ FUNCIONES PARA MODAL MÓVIL DE CATEGORÍAS ============

// Estado temporal para categorías en móvil
let mobileTempCategory = {
    name: '',
    words: []
};
let mobileEditingCategoryId = null;

// Detectar si es dispositivo móvil
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Abrir modal de categorías en móvil
function openMobileCategoryModal() {
    console.log('openMobileCategoryModal called');
    document.getElementById('mobileCategoryModal').style.display = 'flex';
    renderMobileSavedCategories();
    resetMobileCategoryForm();
}

// Cerrar modal de categorías en móvil
function closeMobileCategoryModal() {
    document.getElementById('mobileCategoryModal').style.display = 'none';
    resetMobileCategoryForm();
}

// Mostrar formulario para crear categoría en móvil
function showMobileCreateCategoryForm() {
    try {
        console.log('showMobileCreateCategoryForm called');
        mobileEditingCategoryId = null;

        const titleEl = document.getElementById('mobileCategoryFormTitle');
        const buttonSection = document.getElementById('mobileCreateCategoryButtonSection');
        const formSection = document.getElementById('mobileCreateCategoryForm');

        console.log('Elements found:', {
            titleEl: !!titleEl,
            buttonSection: !!buttonSection,
            formSection: !!formSection
        });

        if (!titleEl || !buttonSection || !formSection) {
            console.error('ERROR: Some elements not found in DOM');
            alert('Error: No se encontraron los elementos del formulario');
            return;
        }

        titleEl.textContent = 'Crear Nueva Categoria';
        buttonSection.style.display = 'none';
        formSection.style.display = 'block';

        console.log('Form should be visible now');

        resetMobileCategoryForm();
    } catch (error) {
        console.error('ERROR in showMobileCreateCategoryForm:', error);
        alert('Error al abrir el formulario: ' + error.message);
    }
}

// Mostrar formulario para editar categoría en móvil
function editMobileCustomCategory(categoryId) {
    const cat = customCategories[categoryId];
    if (!cat) return;

    mobileEditingCategoryId = categoryId;
    document.getElementById('mobileCategoryFormTitle').textContent = `Editar: ${cat.name}`;
    document.getElementById('mobileCreateCategoryButtonSection').style.display = 'none';
    document.getElementById('mobileCreateCategoryForm').style.display = 'block';

    // Cargar datos
    document.getElementById('mobileNewCategoryName').value = cat.name;
    mobileTempCategory = {
        name: cat.name,
        words: [...cat.words]
    };
    updateMobileCustomWordsList();
}

// Cancelar crear/editar en móvil
function cancelMobileEditCategory() {
    document.getElementById('mobileCreateCategoryForm').style.display = 'none';
    document.getElementById('mobileCreateCategoryButtonSection').style.display = 'block';
    resetMobileCategoryForm();
}

// Resetear formulario móvil
function resetMobileCategoryForm() {
    document.getElementById('mobileNewCategoryName').value = '';
    document.getElementById('mobileNewWordNormal').value = '';
    document.getElementById('mobileNewWordClose').value = '';
    mobileTempCategory = { name: '', words: [] };
    mobileEditingCategoryId = null;
    updateMobileCustomWordsList();
}

// Limpiar formulario móvil (versión pública)
function clearMobileCategoryForm() {
    resetMobileCategoryForm();
}

// Agregar palabra en móvil
function addWordToMobileCategory() {
    const normalInput = document.getElementById('mobileNewWordNormal');
    const closeInput = document.getElementById('mobileNewWordClose');
    const rawNormal = normalInput.value.trim();
    const rawCercana = closeInput.value.trim();

    const normal = escapeHtml(rawNormal.substring(0, 100));
    const cercana = rawCercana ? escapeHtml(rawCercana.substring(0, 100)) : '';

    if (!normal) {
        alert('Por favor, ingresa una palabra principal');
        return;
    }

    if (rawNormal.length > 100) {
        alert('La palabra es demasiado larga (máximo 100 caracteres)');
        return;
    }

    const exists = mobileTempCategory.words.some(w =>
        w.normal.toLowerCase() === normal.toLowerCase()
    );
    if (exists) {
        alert('Esta palabra ya existe en la categoria');
        return;
    }

    mobileTempCategory.words.push({
        normal: normal,
        cercana: cercana || normal
    });

    normalInput.value = '';
    closeInput.value = '';
    normalInput.focus();

    updateMobileCustomWordsList();
}

// Actualizar lista de palabras en móvil
function updateMobileCustomWordsList() {
    const container = document.getElementById('mobileCustomWordsList');

    if (mobileTempCategory.words.length === 0) {
        container.innerHTML = '<p style="color: #9dd6ff; text-align: center; font-size: 14px;">No hay palabras agregadas aun</p>';
        return;
    }

    container.innerHTML = '';
    mobileTempCategory.words.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'custom-word-item';

        const hasCloseWord = word.cercana && word.cercana !== word.normal;

        const wordPairDiv = document.createElement('div');
        wordPairDiv.className = 'word-pair';

        const mainSpan = createSafeElement('span', {
            className: 'word-main',
            textContent: word.normal
        });
        wordPairDiv.appendChild(mainSpan);

        if (hasCloseWord) {
            const closeSpan = createSafeElement('span', {
                className: 'word-close',
                textContent: word.cercana
            });
            wordPairDiv.appendChild(closeSpan);
        }

        const deleteBtn = createSafeElement('button', {
            className: 'btn btn-danger btn-small',
            textContent: 'Eliminar'
        });
        deleteBtn.onclick = () => removeWordFromMobileCategory(index);

        item.appendChild(wordPairDiv);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}

// Eliminar palabra de categoría temporal en móvil
function removeWordFromMobileCategory(index) {
    mobileTempCategory.words.splice(index, 1);
    updateMobileCustomWordsList();
}

// Guardar categoría en móvil
function saveMobileCustomCategory() {
    const nameInput = document.getElementById('mobileNewCategoryName');
    const rawName = nameInput.value.trim();
    const name = escapeHtml(rawName.substring(0, 100));

    if (!name) {
        alert('Por favor, ingresa un nombre para la categoria');
        return;
    }

    if (mobileTempCategory.words.length === 0) {
        alert('Agrega al menos una palabra a la categoria');
        return;
    }

    const sanitizedWords = mobileTempCategory.words.map(w => ({
        normal: escapeHtml(w.normal.substring(0, 100)),
        cercana: escapeHtml((w.cercana || w.normal).substring(0, 100))
    }));

    if (mobileEditingCategoryId) {
        customCategories[mobileEditingCategoryId] = {
            name: name,
            words: sanitizedWords
        };
        alert(`Categoria "${name}" actualizada exitosamente!`);
    } else {
        const categoryId = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        customCategories[categoryId] = {
            name: name,
            words: sanitizedWords
        };
        alert(`Categoria "${name}" guardada exitosamente!`);
    }

    saveCustomCategoriesToStorage();
    cancelMobileEditCategory();
    renderMobileSavedCategories();

    // También actualizar la lista de opciones de categoría
    renderCategoryOptions();
}

// Renderizar categorías guardadas en móvil
function renderMobileSavedCategories() {
    const container = document.getElementById('mobileSavedCategoriesList');
    const categoryIds = Object.keys(customCategories);

    if (categoryIds.length === 0) {
        container.innerHTML = '<p style="color: #9dd6ff; text-align: center; font-size: 14px;">No tienes categorias guardadas</p>';
        return;
    }

    container.innerHTML = '';
    categoryIds.forEach(id => {
        const cat = customCategories[id];
        const item = document.createElement('div');
        item.className = 'saved-category-item';

        const nameSpan = createSafeElement('span', {
            className: 'category-name',
            textContent: cat.name
        });
        const countSpan = createSafeElement('span', {
            className: 'word-count',
            textContent: `(${cat.words.length} palabras)`
        });

        const infoDiv = document.createElement('div');
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(countSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'category-actions';

        const useBtn = createSafeElement('button', {
            className: 'btn btn-success btn-small',
            textContent: 'Usar'
        });
        useBtn.onclick = () => selectMobileCustomCategory(id);

        const editBtn = createSafeElement('button', {
            className: 'btn btn-small',
            attributes: { style: 'background-color: #ff9800;' },
            textContent: 'Editar'
        });
        editBtn.onclick = () => editMobileCustomCategory(id);

        const deleteBtn = createSafeElement('button', {
            className: 'btn btn-danger btn-small',
            textContent: 'Eliminar'
        });
        deleteBtn.onclick = () => deleteMobileCustomCategory(id);

        actionsDiv.appendChild(useBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(infoDiv);
        item.appendChild(actionsDiv);
        container.appendChild(item);
    });
}

// Seleccionar categoría personalizada en móvil
function selectMobileCustomCategory(categoryId) {
    gameState.category = categoryId;

    // Actualizar UI
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-category') === categoryId) {
            opt.classList.add('selected');
        }
    });

    const catName = customCategories[categoryId].name;
    alert(`Categoria "${catName}" seleccionada!`);
    closeMobileCategoryModal();
}

// Eliminar categoría en móvil
function deleteMobileCustomCategory(categoryId) {
    if (confirm('¿Estas seguro de que quieres eliminar esta categoria?')) {
        delete customCategories[categoryId];
        saveCustomCategoriesToStorage();
        renderMobileSavedCategories();
        renderCategoryOptions();

        if (gameState.category === categoryId) {
            gameState.category = '';
            const firstOption = document.querySelector('.category-option');
            if (firstOption) {
                firstOption.classList.add('selected');
                gameState.category = firstOption.getAttribute('data-category');
            }
        }
    }
}
