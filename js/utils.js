// utils.js - Funciones utilitarias de seguridad

/**
 * Escapa caracteres HTML especiales para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado seguro para HTML
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';

    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;'
    };

    return text.replace(/[&<>"'`/]/g, char => htmlEscapes[char] || char);
}

/**
 * Sanitiza un objeto de categoría personalizada
 * @param {Object} category - Objeto categoría a sanitizar
 * @returns {Object} - Categoría sanitizada
 */
function sanitizeCategory(category) {
    if (!category || typeof category !== 'object') {
        return { name: '', words: [] };
    }

    return {
        name: escapeHtml(String(category.name || '').substring(0, 100)),
        words: Array.isArray(category.words) ? category.words.map(word => ({
            normal: escapeHtml(String(word.normal || '').substring(0, 100)),
            cercana: escapeHtml(String(word.cercana || '').substring(0, 100))
        })).slice(0, 1000) : [] // Máximo 1000 palabras por categoría
    };
}

/**
 * Sanitiza todas las categorías personalizadas
 * @param {Object} categories - Objeto con categorías
 * @returns {Object} - Categorías sanitizadas
 */
function sanitizeAllCategories(categories) {
    if (!categories || typeof categories !== 'object') {
        return {};
    }

    const sanitized = {};
    const categoryIds = Object.keys(categories).slice(0, 100); // Máximo 100 categorías

    categoryIds.forEach(id => {
        // Sanitizar el ID también
        const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
        if (safeId) {
            sanitized[safeId] = sanitizeCategory(categories[id]);
        }
    });

    return sanitized;
}

/**
 * Sanitiza un nombre de jugador
 * @param {string} name - Nombre del jugador
 * @returns {string} - Nombre sanitizado
 */
function sanitizePlayerName(name) {
    if (typeof name !== 'string') return '';
    // Solo escapar HTML, permitir espacios y caracteres unicode válidos
    return escapeHtml(name.trim().substring(0, 50));
}

/**
 * Valida que el tamaño de datos no exceda el límite de localStorage (~5MB)
 * @param {Object} data - Datos a validar
 * @returns {boolean} - True si es seguro guardar
 */
function isStorageSafe(data) {
    try {
        const serialized = JSON.stringify(data);
        // Límite conservador de 2MB para dejar espacio para otros datos
        const sizeInBytes = new Blob([serialized]).size;
        return sizeInBytes < 2 * 1024 * 1024; // 2MB
    } catch (e) {
        return false;
    }
}

/**
 * Crea un elemento DOM de forma segura sin usar innerHTML
 * @param {string} tag - Tag del elemento
 * @param {Object} options - Opciones (textContent, className, etc.)
 * @returns {HTMLElement} - Elemento seguro
 */
function createSafeElement(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.textContent !== undefined) {
        element.textContent = String(options.textContent);
    }

    if (options.className) {
        element.className = options.className;
    }

    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, String(value));
        });
    }

    return element;
}
