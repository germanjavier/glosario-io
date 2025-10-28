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

// Función para encontrar la mejor voz (femenina, natural, en inglés)
function findBestVoice() {
    // Priorizar voces femeninas naturales en inglés
    const preferredVoices = [
        // Voces femeninas de alta calidad
        { name: 'Google UK English Female', lang: 'en-GB' },
        { name: 'Microsoft Zira Desktop', lang: 'en-US' },
        { name: 'Karen', lang: 'en-AU' },
        { name: 'Samantha', lang: 'en-US' },
        { name: 'Victoria', lang: 'en-US' },
        { name: 'Moira', lang: 'en-IE' },
        { name: 'Tessa', lang: 'en-ZA' },
        // Voces genéricas femeninas
        { name: 'female', lang: 'en' },
        { name: 'woman', lang: 'en' }
    ];

    // Buscar voces preferidas
    for (const preferred of preferredVoices) {
        const foundVoice = availableVoices.find(voice => 
            voice.name.toLowerCase().includes(preferred.name.toLowerCase()) &&
            voice.lang.startsWith('en')
        );
        if (foundVoice) {
            console.log('Voz seleccionada:', foundVoice.name);
            return foundVoice;
        }
    }

    // Fallback: cualquier voz femenina en inglés
    const femaleVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria') ||
         voice.name.toLowerCase().includes('zira'))
    );
    
    if (femaleVoice) {
        console.log('Voz femenina encontrada:', femaleVoice.name);
        return femaleVoice;
    }

    // Fallback final: primera voz en inglés
    const englishVoice = availableVoices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
        console.log('Voz en inglés encontrada:', englishVoice.name);
        return englishVoice;
    }

    // Último fallback: primera voz disponible
    if (availableVoices.length > 0) {
        console.log('Usando voz por defecto:', availableVoices[0].name);
        return availableVoices[0];
    }

    console.warn('No se encontraron voces disponibles');
    return null;
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

// Función mejorada para pronunciar el término
function speakTerm(term) {
    console.log('🔊 Pronunciando:', term);
    
    // Detener cualquier reproducción anterior
    speechSynthesis.cancel();
    
    // Actualizar estado
    if (status) {
        status.textContent = `Reproduciendo: ${term}`;
        status.className = 'speaking';
    }
    
    // Crear el mensaje de voz con configuración mejorada
    const message = new SpeechSynthesisUtterance(term);
    
    // Configuración optimizada para claridad y naturalidad
    message.lang = 'en-US';
    message.rate = 0.85;    // Velocidad ligeramente más lenta para mejor comprensión
    message.pitch = 1.1;    // Tono ligeramente más alto (más femenino)
    message.volume = 1.0;   // Volumen máximo
    
    // Seleccionar la mejor voz disponible
    const selectedVoice = findBestVoice();
    if (selectedVoice) {
        message.voice = selectedVoice;
    }
    
    // Evento cuando comienza la reproducción
    message.onstart = function() {
        console.log('▶️ Iniciando reproducción con voz:', selectedVoice ? selectedVoice.name : 'por defecto');
    };
    
    // Reproducir
    speechSynthesis.speak(message);
    
    // Cuando termine la reproducción
    message.onend = function() {
        console.log('✅ Reproducción completada');
        if (status) {
            status.textContent = 'Listo';
            status.className = '';
        }
    };
    
    message.onerror = function(event) {
        console.error('❌ Error al reproducir:', event);
        if (status) {
            status.textContent = 'Error al reproducir el audio';
            status.className = 'error';
        }
    };
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