// state.js - Estado global del juego

const gameState = {
    players: [],
    category: '',
    impostorCount: 1,
    closeWordCount: 0,
    impostors: [],
    closeWords: [],
    words: [],
    currentPlayerIndex: 0,
    playerOrder: [],
    secretsRevealed: false
};

// Estado temporal para crear categoría personalizada
let tempCustomCategory = {
    name: '',
    words: [] // Array de { normal: string, cercana: string }
};

// Categorías personalizadas guardadas (se cargan desde localStorage)
let customCategories = {};
