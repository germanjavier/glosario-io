// app.js - Glosario de Pronunciación Mejorado
// ===============================================

// Configuration
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let filteredGlossary = [];
let glossary = [];
let availableVoices = [];

// DOM Elements
const glossaryBody = document.getElementById('glossaryBody');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const status = document.getElementById('status');


// --- VOICE CONFIGURATION AND SELECTION ---

/**
 * Función para cargar y configurar las voces.
 * Espera a que las voces estén disponibles para proceder.
 */
function initializeVoices() {
    return new Promise((resolve) => {
        // Si las voces ya están disponibles al inicio
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            availableVoices = voices;
            console.log('✅ Voces disponibles al inicio:', voices.length);
            resolve();
        } else {
            // Esperar el evento 'onvoiceschanged'
            speechSynthesis.onvoiceschanged = () => {
                availableVoices = speechSynthesis.getVoices();
                console.log('✅ Voces cargadas por evento:', availableVoices.length);
                resolve();
            };
        }
    });
}

/**
 * Función para encontrar la mejor voz de español disponible para claridad.
 * Prioriza voces de alta calidad o cualquier voz en español.
 */
function findBestVoice() {
    if (!availableVoices || availableVoices.length === 0) {
        console.warn('⚠️ No hay voces disponibles.');
        return null;
    }

    // --- PRIORIDAD 1: Voces de español de alta calidad (más claras y neutrales) ---
    const spanishHighQualityNames = [
        'Google español', 
        'Microsoft Helena Desktop', // Voz de Microsoft, común en Windows
        'Microsoft Laura Desktop', 
        'Monica' // Voz de Mac
    ];

    for (const name of spanishHighQualityNames) {
        const found = availableVoices.find(voice => 
            voice.name.toLowerCase().includes(name.toLowerCase()) && 
            voice.lang.startsWith('es')
        );
        if (found) {
            console.log('🎙️ Voz seleccionada (Alta Calidad ES):', `${found.name} (${found.lang})`);
            return found;
        }
    }

    // --- PRIORIDAD 2: Cualquier voz en español (es) ---
    const spanishVoice = availableVoices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
        console.log('🎙️ Voz seleccionada (Cualquier ES):', `${spanishVoice.name} (${spanishVoice.lang})`);
        return spanishVoice;
    }

    // --- PRIORIDAD 3: Voz por defecto si no hay español ---
    console.warn('⚠️ No se encontró voz en español. Usando la primera voz disponible.');
    return availableVoices[0] || null;
}


// --- GLOSSARY AND TABLE FUNCTIONS ---

// Fetch glossary data
async function loadGlossary() {
    try {
        const response = await fetch('glossary.json');
        const data = await response.json();
        return data.terms;
    } catch (error) {
        console.error('❌ Error loading glossary:', error);
        return [];
    }
}

// Filter glossary based on search input
function filterGlossary(searchTerm) {
    if (!searchTerm.trim()) {
        filteredGlossary = [...glossary];
    } else {
        const term = searchTerm.toLowerCase();
        filteredGlossary = glossary.filter(item => 
            item.term.toLowerCase().includes(term) || 
            item.definition.toLowerCase().includes(term) ||
            (item.translation && item.translation.toLowerCase().includes(term))
        );
    }
}

// Render glossary table
function renderTable() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedItems = filteredGlossary.slice(start, end);
    
    if (paginatedItems.length === 0) {
        glossaryBody.innerHTML = `
            <tr>
                <td colspan="3" class="no-results">
                    No se encontraron términos que coincidan con la búsqueda.
                </td>
            </tr>`;
        return;
    }

    let tableHTML = '';
    
    paginatedItems.forEach((item, index) => {
        // Determina el texto a pronunciar: la pronunciación (si existe) o el término.
        const textToSpeak = item.pronunciation || item.term;

        tableHTML += `
            <tr>
                <td>
                    <div class="term">${item.term}</div>
                    <div class="pronunciation">${item.pronunciation || ''}</div>
                </td>
                <td>
                    <div class="definition">${item.definition}</div>
                    ${item.translation ? `<div class="translation">${item.translation}</div>` : ''}
                    ${item.example ? `<div class="example"><strong>Ejemplo:</strong> ${item.example}</div>` : ''}
                </td>
                <td>
                    <button class="play-btn" 
                            title="Escuchar pronunciación"
                            data-text-to-speak="${textToSpeak}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd" d="M18.97 6.97a.75.75 0 0 1 1.06 0l-.53.53l.53-.53h.001l.001.002l.003.002l.007.007l.02.02l.062.069c.05.057.12.138.201.241A6.87 6.87 0 0 1 21.75 11.5a6.87 6.87 0 0 1-1.425 4.189a5 5 0 0 1-.264.31l-.02.02l-.006.007l-.003.002v.001h-.001l-.51-.508l.51.51a.75.75 0 1 1-1.061-1.061l.53.53l-.53-.53h-.001v.001l-.002.001l-.005.005l.033-.036q.048-.052.139-.167a5.37 5.37 0 0 0 .448-5.843a5 5 0 0 0-.448-.685a3 3 0 0 0-.172-.203l-.005-.005a.75.75 0 0 1 .003-1.058m-5.933-3.574c1.163-.767 2.713.068 2.713 1.461v14.286c0 1.394-1.55 2.228-2.713 1.461l-6-3.955a.25.25 0 0 0-.137-.042H4a2.75 2.75 0 0 1-2.75-2.75v-3.714A2.75 2.75 0 0 1 4 7.393h2.9a.25.25 0 0 0 .138-.041z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    glossaryBody.innerHTML = tableHTML;
    
    // El setup de event listeners se moverá a setupEventListeners para usar delegación
}


// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredGlossary.length / ITEMS_PER_PAGE);
    
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Handle page change
function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else {
        currentPage--;
    }
    
    renderTable();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- SPEECH UTILITY FUNCTIONS ---

/**
 * Función para mejorar la pronunciación de términos técnicos.
 * Convierte siglas a letras separadas para una mejor lectura.
 */
function improvePronunciation(text) {
    // Reemplazar guiones bajos por espacios
    return text
        .replace(/_/g, ' ')
        // Asegurar que siglas comunes se lean como letras
        .replace(/\b(API)\b/gi, 'A P I')
        .replace(/\b(URL)\b/gi, 'U R L')
        .replace(/\b(HTTP|HTTPS)\b/gi, (match) => match.split('').join(' ')) // H T T P
        .replace(/\b(HTML)\b/gi, 'H T M L')
        .replace(/\b(CSS)\b/gi, 'C S S')
        .replace(/\b(JS)\b/gi, 'J S') // Se puede dejar 'JavaScript' si se prefiere
        .replace(/\b(JSON)\b/gi, 'Jaison') // 'Jason' en español es más claro.
        .replace(/\b(UI|UX)\b/gi, (match) => match.split('').join(' ')) // U I, U X
        // Asegurar espaciado correcto
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Función mejorada para pronunciar el término con la mejor calidad posible.
 */
function speakTerm(textToSpeak) {
    // Detener cualquier reproducción anterior
    speechSynthesis.cancel();
    
    // Si el texto a pronunciar es nulo, no hace nada
    if (!textToSpeak) {
        console.warn('No hay texto para pronunciar.');
        if (status) {
            status.textContent = 'No hay texto para pronunciar.';
            status.className = 'error';
        }
        return;
    }
    
    // Actualizar estado
    if (status) {
        status.textContent = `Reproduciendo: ${textToSpeak}`;
        status.className = 'speaking';
    }
    
    try {
        // Crear el mensaje de voz
        const message = new SpeechSynthesisUtterance(improvePronunciation(textToSpeak));
        
        // --- CONFIGURACIÓN CLAVE PARA CLARIDAD ---
        message.rate = 0.85;      // Más lento para mejor comprensión (0.85)
        message.pitch = 1.0;      // Tono neutral (1.0)
        message.volume = 1.0;     // Volumen máximo
        
        // Seleccionar la mejor voz disponible
        const selectedVoice = findBestVoice();
        if (selectedVoice) {
            message.voice = selectedVoice;
            message.lang = selectedVoice.lang; // Usar el idioma de la voz seleccionada
        } else {
            // Fallback: usar español de España por defecto si no hay voz seleccionada
            message.lang = 'es-ES'; 
            console.warn('Usando idioma por defecto (es-ES)');
        }
        
        // Evento cuando termina la reproducción
        message.onend = function() {
            if (status) {
                status.textContent = 'Listo';
                status.className = '';
            }
        };
        
        // Manejo de errores
        message.onerror = function(event) {
            console.error('❌ Error al reproducir el audio:', event);
            if (status) {
                status.textContent = 'Error al reproducir el audio';
                status.className = 'error';
            }
        };
        
        // Reproducir el mensaje
        speechSynthesis.speak(message);
        
    } catch (error) {
        console.error('❌ Error crítico al reproducir el audio:', error);
    }
}


// --- EVENT LISTENERS AND INITIALIZATION ---

/**
 * Función para configurar los listeners de eventos.
 * Usa delegación de eventos para el botón de Play.
 */
function setupEventListeners() {
    // 1. Funcionalidad de búsqueda
    searchInput.addEventListener('input', function(e) {
        filterGlossary(e.target.value);
        currentPage = 1;
        renderTable();
        updatePagination();
    });

    // 2. Paginación
    prevBtn.addEventListener('click', () => changePage('prev'));
    nextBtn.addEventListener('click', () => changePage('next'));
    
    // 3. Delegación de eventos para botones de reproducción (Play)
    // Escucha en el cuerpo de la tabla para manejar clicks en botones dinámicos
    glossaryBody.addEventListener('click', (e) => {
        const playButton = e.target.closest('.play-btn');
        if (playButton) {
            // Obtenemos el texto directamente del atributo data-text-to-speak
            const textToSpeak = playButton.getAttribute('data-text-to-speak'); 
            
            console.log('Botón clickeado, texto a pronunciar:', textToSpeak); 
            
            if (textToSpeak) {
                speakTerm(textToSpeak);
            }
        }
    });
}


/**
 * Inicializa la aplicación.
 */
async function initApp() {
    try {
        console.log('🚀 Inicializando aplicación...');
        
        // 1. Inicializar voces primero
        await initializeVoices();
        
        // 2. Cargar datos del glosario
        glossary = await loadGlossary();
        filteredGlossary = [...glossary];
        
        // 3. Renderizar vista inicial y configurar listeners
        renderTable();
        updatePagination();
        setupEventListeners();
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);