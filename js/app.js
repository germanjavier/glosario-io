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

// Función para cargar y configurar las voces
function initializeVoices() {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            availableVoices = voices;
            console.log('Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
            resolve();
        } else {
            speechSynthesis.onvoiceschanged = () => {
                availableVoices = speechSynthesis.getVoices();
                console.log('Voces cargadas:', availableVoices.map(v => `${v.name} (${v.lang})`));
                resolve();
            };
        }
    });
}

// Función para encontrar la mejor voz disponible
function findBestVoice() {
    if (!availableVoices || availableVoices.length === 0) {
        console.warn('No hay voces disponibles');
        return null;
    }

    // Lista priorizada de voces preferidas (más naturales y claras)
    const voicePreferences = [
        // Voces de alta calidad (más naturales)
        { name: 'Google UK English Female', lang: 'en-GB' },
        { name: 'Microsoft Zira Desktop', lang: 'en-US' },
        { name: 'Microsoft Hazel Desktop', lang: 'en-GB' },
        { name: 'Karen', lang: 'en-AU' },
        { name: 'Samantha', lang: 'en-US' },
        { name: 'Victoria', lang: 'en-US' },
        { name: 'Moira', lang: 'en-IE' },
        { name: 'Tessa', lang: 'en-ZA' },
        { name: 'Fiona', lang: 'en-scotland' },
        { name: 'Serena', lang: 'en-GB' },
        
        // Patrones de voces femeninas
        { name: 'female', lang: 'en', type: 'pattern' },
        { name: 'woman', lang: 'en', type: 'pattern' },
        { name: 'zira', lang: 'en', type: 'pattern' },
        
        // Cualquier voz en inglés
        { lang: 'en', type: 'lang' },
        
        // Cualquier voz disponible
        { type: 'any' }
    ];

    // Buscar según preferencias
    for (const pref of voicePreferences) {
        let foundVoice = null;
        
        if (pref.name && pref.lang && pref.type === 'pattern') {
            // Buscar por patrón en el nombre y en el idioma
            foundVoice = availableVoices.find(voice => 
                voice.name.toLowerCase().includes(pref.name.toLowerCase()) &&
                voice.lang.startsWith(pref.lang)
            );
        } else if (pref.name && pref.lang) {
            // Búsqueda exacta por nombre e idioma
            foundVoice = availableVoices.find(voice => 
                voice.name === pref.name && 
                voice.lang === pref.lang
            );
        } else if (pref.lang) {
            // Cualquier voz en el idioma especificado
            foundVoice = availableVoices.find(voice => 
                voice.lang.startsWith(pref.lang)
            );
        } else if (pref.type === 'any') {
            // Cualquier voz disponible
            foundVoice = availableVoices[0];
        }

        if (foundVoice) {
            console.log('Voz seleccionada:', `${foundVoice.name} (${foundVoice.lang})`);
            return foundVoice;
        }
    }

    // Si no se encontró ninguna voz, devolver la primera disponible
    console.warn('Usando la primera voz disponible:', availableVoices[0].name);
    return availableVoices[0];
}

// Función para cargar el glosario
async function loadGlossary() {
    try {
        const response = await fetch('glossary.json');
        const data = await response.json();
        return data.terms;
    } catch (error) {
        console.error('Error loading glossary:', error);
        return [];
    }
}

// Función para filtrar el glosario
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

// Función para renderizar la tabla
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
                    <button class="play-btn" data-index="${start + index}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd" d="M18.97 6.97a.75.75 0 0 1 1.06 0l-.53.53l.53-.53h.001l.001.002l.003.002l.007.007l.02.02l.062.069c.05.057.12.138.201.241A6.87 6.87 0 0 1 21.75 11.5a6.87 6.87 0 0 1-1.425 4.189a5 5 0 0 1-.264.31l-.02.02l-.006.007l-.003.002v.001h-.001l-.51-.508l.51.51a.75.75 0 1 1-1.061-1.061l.53.53l-.53-.53h-.001v.001l-.002.001l.005-.005l.033-.036q.048-.052.139-.167a5.37 5.37 0 0 0 .448-5.843a5 5 0 0 0-.448-.685a3 3 0 0 0-.172-.203l-.005-.005a.75.75 0 0 1 .003-1.058m-5.933-3.574c1.163-.767 2.713.068 2.713 1.461v14.286c0 1.394-1.55 2.228-2.713 1.461l-6-3.955a.25.25 0 0 0-.137-.042H4a2.75 2.75 0 0 1-2.75-2.75v-3.714A2.75 2.75 0 0 1 4 7.393h2.9a.25.25 0 0 0 .138-.041z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    glossaryBody.innerHTML = tableHTML;
    
    // Agregar event listeners a los botones
    addButtonListeners();
}

// Función para agregar listeners a los botones
function addButtonListeners() {
    const buttons = document.querySelectorAll('.play-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const term = filteredGlossary[index].term;
            speakTerm(term);
        });
    });
}

// Función mejorada para pronunciar el término con la mejor calidad posible
function speakTerm(term) {
    console.log('🔊 Pronunciando:', term);
    
    // Detener cualquier reproducción anterior
    speechSynthesis.cancel();
    
    // Actualizar estado
    if (status) {
        status.textContent = `Reproduciendo: ${term}`;
        status.className = 'speaking';
    }
    
    try {
        // Crear el mensaje de voz con configuración mejorada
        const message = new SpeechSynthesisUtterance(term);
        
        // Configuración optimizada para máxima claridad y naturalidad
        message.rate = 0.9;      // Velocidad ligeramente más lenta para mejor comprensión
        message.pitch = 1.05;    // Tono ligeramente más alto para mayor claridad
        message.volume = 1.0;    // Volumen máximo
        
        // Seleccionar la mejor voz disponible
        const selectedVoice = findBestVoice();
        if (selectedVoice) {
            message.voice = selectedVoice;
            message.lang = selectedVoice.lang; // Usar el idioma de la voz seleccionada
        } else {
            // Si no se encontró ninguna voz, usar configuración por defecto
            message.lang = 'en-US';
            console.warn('Usando configuración de voz por defecto');
        }
        
        // Mejorar la pronunciación de términos técnicos
        message.text = improvePronunciation(term);
        
        // Evento cuando comienza la reproducción
        message.onstart = function() {
            console.log('▶️ Reproduciendo con voz:', selectedVoice ? 
                `${selectedVoice.name} (${selectedVoice.lang})` : 'por defecto');
        };
        
        // Cuando termine la reproducción
        message.onend = function() {
            console.log('✅ Reproducción completada');
            if (status) {
                status.textContent = 'Listo';
                status.className = '';
            }
        };
        
        // Manejo de errores mejorado
        message.onerror = function(event) {
            console.error('❌ Error al reproducir:', event);
            if (status) {
                status.textContent = 'Error al reproducir el audio';
                status.className = 'error';
            }
            
            // Intentar con una configuración más básica en caso de error
            if (event.error === 'synthesis-failed') {
                console.log('Intentando con configuración alternativa...');
                message.rate = 1.0;
                message.pitch = 1.0;
                speechSynthesis.speak(message);
            }
        };
        
        // Reproducir el mensaje
        speechSynthesis.speak(message);
        
    } catch (error) {
        console.error('Error crítico al reproducir el audio:', error);
        if (status) {
            status.textContent = 'Error crítico al reproducir el audio';
            status.className = 'error';
        }
    }
}

// Función para mejorar la pronunciación de términos técnicos
function improvePronunciation(text) {
    // Reemplazar caracteres especiales y mejorar pronunciación
    return text
        // Reemplazar guiones bajos por espacios
        .replace(/_/g, ' ')
        // Mejorar pronunciación de siglas comunes
        .replace(/\b(API)\b/gi, 'A P I')
        .replace(/\b(URL)\b/gi, 'U R L')
        .replace(/\b(HTTP)\b/gi, 'H T T P')
        .replace(/\b(HTTPS)\b/gi, 'H T T P S')
        .replace(/\b(HTML)\b/gi, 'H T M L')
        .replace(/\b(CSS)\b/gi, 'C S S')
        .replace(/\b(JS)\b/gi, 'JavaScript')
        .replace(/\b(JSON)\b/gi, 'Jason')
        .replace(/\b(UI)\b/gi, 'U I')
        .replace(/\b(UX)\b/gi, 'U X')
        // Asegurar que los números se lean correctamente
        .replace(/(\d+)/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para actualizar la paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredGlossary.length / ITEMS_PER_PAGE);
    
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Función para cambiar de página
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

// Inicializar la aplicación
async function initApp() {
    try {
        console.log('🚀 Inicializando aplicación...');
        
        // Inicializar voces primero
        await initializeVoices();
        
        // Cargar datos del glosario
        glossary = await loadGlossary();
        filteredGlossary = [...glossary];
        
        // Renderizar tabla inicial
        renderTable();
        updatePagination();
        
        // Event listeners
        searchInput.addEventListener('input', function(e) {
            filterGlossary(e.target.value);
            currentPage = 1;
            renderTable();
            updatePagination();
        });
        
        prevBtn.addEventListener('click', () => changePage('prev'));
        nextBtn.addEventListener('click', () => changePage('next'));
        
        console.log('✅ Aplicación inicializada correctamente');
        console.log('🎯 Voces disponibles:', availableVoices.length);
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);