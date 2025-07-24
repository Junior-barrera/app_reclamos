// Base de datos simulada de usuarios
const users = [
    {
        username: "junior",
        password: "junior132",
        fullName: "Admin pro Max",
        department: "admin General",
        permissions: ["view_claims", "update_claims", "add_photos"],
        claims: [101, 102, 103]
    },
    {
        username: "iluminacion1",
        password: "ilum123",
        fullName: "Trabajador Iluminación",
        department: "Iluminación Pública",
        permissions: ["view_claims", "update_claims", "add_photos"],
        claims: [101, 102, 103]
    },
    {
        username: "aseo1",
        password: "aseo123",
        fullName: "Trabajador Aseo",
        department: "Aseo y Ornato",
        permissions: ["view_claims", "update_claims", "add_photos"],
        claims: [201, 202]
    },
    {
        username: "areasverdes1",
        password: "verde123",
        fullName: "Trabajador Áreas Verdes",
        department: "Áreas Verdes",
        permissions: ["view_claims", "update_claims", "add_photos"],
        claims: [301, 302, 303, 304]
    }
];

// Base de datos simulada de reclamos
const claimsDatabase = {
    101: {
        id: 101,
        type: "Iluminación",
        description: "Luminaria fundida en calle Prat #123",
        address: "Calle Prat #123, Arica",
        status: "pending",
        assignedTo: "iluminacion1",
        date: "2023-05-15",
        photos: [],
        notes: "",
        coordinates: [-18.4745, -70.3142] // Coordenadas simuladas
    },
    102: {
        id: 102,
        type: "Iluminación",
        description: "Poste inclinado en plaza Colón",
        address: "Plaza Colón, Arica",
        status: "in_progress",
        assignedTo: "iluminacion1",
        date: "2023-05-10",
        photos: [],
        notes: "Necesita revisión estructural",
        coordinates: [-18.4763, -70.3187]
    },
    103: {
        id: 103,
        type: "Iluminación",
        description: "Caja de conexiones abierta",
        address: "Av. General Velásquez #456",
        status: "completed",
        assignedTo: "iluminacion1",
        date: "2023-05-05",
        photos: ["photo1.jpg", "photo2.jpg"],
        notes: "Reparación completada y caja asegurada",
        coordinates: [-18.4721, -70.3105]
    },
    201: {
        id: 201,
        type: "Aseo",
        description: "Basura acumulada en esquina",
        address: "Calle 21 de Mayo con Chacabuco",
        status: "pending",
        assignedTo: "aseo1",
        date: "2023-05-14",
        photos: [],
        notes: "",
        coordinates: [-18.4789, -70.3162]
    },
    202: {
        id: 202,
        type: "Aseo",
        description: "Contenedor dañado",
        address: "Av. Santa María #789",
        status: "in_progress",
        assignedTo: "aseo1",
        date: "2023-05-12",
        photos: ["photo3.jpg"],
        notes: "Contenedor necesita reemplazo",
        coordinates: [-18.4802, -70.3128]
    },
    301: {
        id: 301,
        type: "Áreas Verdes",
        description: "Árbol con ramas peligrosas",
        address: "Parque Vicuña Mackenna",
        status: "pending",
        assignedTo: "areasverdes1",
        date: "2023-05-13",
        photos: [],
        notes: "",
        coordinates: [-18.4756, -70.3201]
    },
    302: {
        id: 302,
        type: "Áreas Verdes",
        description: "Césped necesita corte",
        address: "Plaza 1 de Mayo",
        status: "completed",
        assignedTo: "areasverdes1",
        date: "2023-05-08",
        photos: ["photo4.jpg"],
        notes: "Trabajo completado el 10/05",
        coordinates: [-18.4733, -70.3159]
    },
    303: {
        id: 303,
        type: "Áreas Verdes",
        description: "Riego automático no funciona",
        address: "Bandera con Sotomayor",
        status: "in_progress",
        assignedTo: "areasverdes1",
        date: "2023-05-11",
        photos: [],
        notes: "Necesita revisión de tuberías",
        coordinates: [-18.4778, -70.3135]
    },
    304: {
        id: 304,
        type: "Áreas Verdes",
        description: "Nuevas plantas necesarias",
        address: "Camino a Azapa km 3",
        status: "pending",
        assignedTo: "areasverdes1",
        date: "2023-05-09",
        photos: [],
        notes: "",
        coordinates: [-18.4821, -70.3097]
    }
};

// Estado de la aplicación
let currentUser = null;
let currentClaim = null;
let map = null;
let markers = {};
let isOnline = navigator.onLine;

// Funciones de utilidad
function showScreen(screenId) {
    try {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    } catch (error) {
        console.error('Error al cambiar pantalla:', error);
        showError('Error al cargar la pantalla');
    }
}

function showError(message) {
    try {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        console.error('Error al mostrar mensaje de error:', error);
    }
}

function showOfflineWarning() {
    if (!isOnline) {
        const offlineWarning = document.createElement('div');
        offlineWarning.className = 'offline-warning';
        offlineWarning.textContent = 'Estás trabajando sin conexión';
        document.body.appendChild(offlineWarning);
        
        setTimeout(() => {
            offlineWarning.remove();
        }, 3000);
    }
}

// Funciones de autenticación
function attemptLogin() {
    try {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!username || !password) {
            showError('Por favor ingrese usuario y contraseña');
            return;
        }
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            loginSuccess(user);
        } else {
            showError('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error en el login:', error);
        showError('Error en el proceso de login');
    }
}

function loginSuccess(user) {
    try {
        currentUser = user;
        
        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            timestamp: new Date().getTime()
        }));
        
        // Actualizar la interfaz con la información del usuario
        const fullnameElement = document.getElementById('user-fullname');
        const departmentElement = document.getElementById('user-department');
        const welcomeElement = document.getElementById('welcome-message');
        
        if (fullnameElement) fullnameElement.textContent = user.fullName;
        if (departmentElement) departmentElement.textContent = user.department;
        if (welcomeElement) welcomeElement.textContent = `Bienvenido, ${user.fullName.split(' ')[0]}`;
        
        // Cargar los reclamos del usuario
        loadUserClaims();
        
        // Cambiar a la pantalla principal
        showScreen('main-screen');
        
        // Mostrar advertencia si está offline
        showOfflineWarning();
    } catch (error) {
        console.error('Error en loginSuccess:', error);
        showError('Error al cargar la sesión');
    }
}
function logout() {
    try {
        // Limpiar localStorage
        localStorage.removeItem('currentUser');
        
        currentUser = null;
        currentClaim = null;
        
        // Limpiar campos de login
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        // Cerrar el mapa si está abierto
        if (map) {
            map.remove();
            map = null;
            markers = {};
        }
        
        showScreen('login-screen');
    } catch (error) {
        console.error('Error en logout:', error);
        showError('Error al cerrar sesión');
    }
}
// Función para guardar configuración
function saveSettings() {
    try {
        const settings = {
            notifications: {
                newClaims: document.getElementById('notify-new-claims').checked,
                statusChanges: document.getElementById('notify-status-changes').checked,
                messages: document.getElementById('notify-messages').checked
            },
            accessibility: {
                fontSize: document.getElementById('font-size').value,
                colorScheme: document.getElementById('color-scheme').value
            }
        };
        
        localStorage.setItem('appSettings', JSON.stringify(settings));
        alert('Configuración guardada correctamente');
        
        // Aplicar cambios inmediatos
        applySettings(settings);
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        showError('Error al guardar configuración');
    }
}
function applySettings(settings) {
    // Aplicar tamaño de texto
    document.documentElement.style.setProperty('--base-font-size', 
        settings.accessibility.fontSize === 'small' ? '14px' :
        settings.accessibility.fontSize === 'large' ? '18px' :
        settings.accessibility.fontSize === 'xlarge' ? '20px' : '16px');
    
    // Aplicar esquema de color
    if (settings.accessibility.colorScheme === 'dark-mode' && !darkMode) {
        toggleDarkMode();
    } else if (settings.accessibility.colorScheme === 'light-mode' && darkMode) {
        toggleDarkMode();
    } else if (settings.accessibility.colorScheme === 'high-contrast') {
        // Implementar modo alto contraste
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
}
function togglePasswordVisibility() {
    try {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.querySelector('.toggle-password');
        
        if (passwordInput && toggleButton) {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            toggleButton.textContent = passwordInput.type === 'password' ? '👁️' : '👁️';
        }
    } catch (error) {
        console.error('Error al alternar visibilidad de contraseña:', error);
    }
}

// Funciones de gestión de reclamos
function loadUserClaims() {
    try {
        const claimsList = document.getElementById('claims-list');
        if (!claimsList) return;
        
        claimsList.innerHTML = '';
        
        if (!currentUser || !currentUser.claims) return;
        
        // Contadores para estadísticas
        let total = 0;
        let pending = 0;
        let completed = 0;
        
        currentUser.claims.forEach(claimId => {
            const claim = claimsDatabase[claimId];
            if (!claim) return;
            
            total++;
            if (claim.status === 'pending') pending++;
            if (claim.status === 'completed') completed++;
            
            const claimElement = document.createElement('div');
            claimElement.className = 'claim-item fade-in';
            claimElement.onclick = () => openClaimDetail(claimId);
            
            let statusClass = '';
            let statusText = '';
            
            switch(claim.status) {
                case 'pending':
                    statusClass = 'status-pending';
                    statusText = 'Pendiente';
                    break;
                case 'in_progress':
                    statusClass = 'status-in-progress';
                    statusText = 'En progreso';
                    break;
                case 'completed':
                    statusClass = 'status-completed';
                    statusText = 'Completado';
                    break;
            }
            
            claimElement.innerHTML = `
                <div class="claim-info">
                    <strong>${escapeHTML(claim.type)}</strong>
                    <p>${escapeHTML(claim.description)}</p>
                    <small>${escapeHTML(claim.address)}</small>
                </div>
                <div class="claim-status ${statusClass}">${escapeHTML(statusText)}</div>
            `;
            
            claimsList.appendChild(claimElement);
        });
        
        // Actualizar estadísticas
        const totalElement = document.getElementById('total-claims');
        const pendingElement = document.getElementById('pending-claims');
        const completedElement = document.getElementById('completed-claims');
        
        if (totalElement) totalElement.textContent = total;
        if (pendingElement) pendingElement.textContent = pending;
        if (completedElement) completedElement.textContent = completed;
    } catch (error) {
        console.error('Error al cargar reclamos:', error);
        showError('Error al cargar los reclamos');
    }
}

function openClaimDetail(claimId) {
    try {
        const claim = claimsDatabase[claimId];
        if (!claim) {
            showError('Reclamo no encontrado');
            return;
        }
        
        currentClaim = claim;
        
        const detailContent = document.getElementById('claim-detail-content');
        if (!detailContent) return;
        
        detailContent.innerHTML = `
            <h4>${escapeHTML(claim.type)}</h4>
            <p>${escapeHTML(claim.description)}</p>
            
            <div class="detail-row">
                <span class="detail-label">Dirección:</span>
                <span>${escapeHTML(claim.address)}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span>${escapeHTML(claim.date)}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span>${escapeHTML(getStatusText(claim.status))}</span>
            </div>
        `;
        
        // Cargar fotos
        const photosContainer = document.getElementById('claim-photos');
        if (photosContainer) {
            photosContainer.innerHTML = '';
            
            if (claim.photos && claim.photos.length > 0) {
                claim.photos.forEach(photo => {
                    const img = document.createElement('img');
                    img.src = photo;
                    img.className = 'photo-thumbnail';
                    img.alt = `Foto del reclamo ${claim.id}`;
                    photosContainer.appendChild(img);
                });
            } else {
                photosContainer.innerHTML = '<p>No hay fotos para este reclamo</p>';
            }
        }
        
        // Cargar notas
        const notesInput = document.getElementById('claim-notes');
        if (notesInput) {
            notesInput.value = claim.notes || '';
        }
        
        showScreen('claim-detail-screen');
    } catch (error) {
        console.error('Error al abrir detalle de reclamo:', error);
        showError('Error al cargar el reclamo');
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Pendiente';
        case 'in_progress': return 'En progreso';
        case 'completed': return 'Completado';
        default: return status;
    }
}

function changeClaimStatus(newStatus) {
    try {
        if (!currentClaim) return;
        
        currentClaim.status = newStatus;
        claimsDatabase[currentClaim.id].status = newStatus;
        
        // Actualizar la interfaz
        loadUserClaims();
        openClaimDetail(currentClaim.id);
        
        // Simular guardado en servidor
        if (isOnline) {
            console.log(`Estado del reclamo ${currentClaim.id} cambiado a ${newStatus} (enviado al servidor)`);
        } else {
            console.log(`Estado del reclamo ${currentClaim.id} cambiado a ${newStatus} (guardado localmente)`);
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        showError('Error al actualizar el estado');
    }
}

function saveClaimNotes() {
    try {
        if (!currentClaim) return;
        
        const notesInput = document.getElementById('claim-notes');
        if (!notesInput) return;
        
        const notes = notesInput.value;
        currentClaim.notes = notes;
        claimsDatabase[currentClaim.id].notes = notes;
        
        // Mostrar confirmación
        alert('Notas guardadas correctamente');
        
        // Simular guardado en servidor
        if (isOnline) {
            console.log(`Notas del reclamo ${currentClaim.id} actualizadas (enviado al servidor)`);
        } else {
            console.log(`Notas del reclamo ${currentClaim.id} actualizadas (guardado localmente)`);
        }
    } catch (error) {
        console.error('Error al guardar notas:', error);
        showError('Error al guardar las notas');
    }
}

function addPhotoToClaim() {
    try {
        if (!currentClaim) return;
        
        // Simulamos diferentes tipos de entrada de fotos
        const inputMethod = confirm("¿Desea tomar una foto nueva o seleccionar de la galería?") 
            ? "camera" : "gallery";
        
        // Simulamos la foto (en una app real, esto usaría la API de cámara)
        const newPhotoName = `photo-${inputMethod}-${Date.now()}.jpg`;
        
        if (!currentClaim.photos) {
            currentClaim.photos = [];
        }
        
        currentClaim.photos.push(newPhotoName);
        claimsDatabase[currentClaim.id].photos = currentClaim.photos;
        
        // Actualizar la vista
        openClaimDetail(currentClaim.id);
        
        // Simular guardado en servidor
        if (isOnline) {
            console.log(`Foto añadida al reclamo ${currentClaim.id} desde ${inputMethod} (enviado al servidor)`);
        } else {
            console.log(`Foto añadida al reclamo ${currentClaim.id} desde ${inputMethod} (guardado localmente)`);
        }
    } catch (error) {
        console.error('Error al añadir foto:', error);
        showError('Error al añadir foto');
    }
}

// Funciones del mapa
function initMap() {
    try {
        // Eliminar el mapa existente si hay uno
        if (map) {
            map.remove();
            map = null;
            markers = {};
        }

        // Esperar a que el contenedor esté visible
        if (!document.getElementById('map-screen').classList.contains('active')) return;
        
        // Coordenadas de Arica, Chile
        const aricaCoords = [-18.4783, -70.3126];
        
        // Crear el mapa con opciones mejoradas
        map = L.map('map-container', {
            zoomControl: true,
            preferCanvas: true
        }).setView(aricaCoords, 13);
        
        // Capa base
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Añadir marcadores
        updateMapMarkers();
        
        // Forzar redibujado del mapa
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        showError('Error al cargar el mapa');
    }
}

function updateMapMarkers() {
    try {
        if (!map || !currentUser) return;
        
        // Limpiar marcadores existentes
        Object.values(markers).forEach(marker => map.removeLayer(marker));
        markers = {};
        
        // Añadir nuevos marcadores
        currentUser.claims.forEach(claimId => {
            const claim = claimsDatabase[claimId];
            if (!claim || !claim.coordinates) return;
            
            const marker = L.marker(claim.coordinates).addTo(map)
                .bindPopup(`
                    <b>${escapeHTML(claim.type)}</b><br>
                    ${escapeHTML(claim.description)}<br>
                    <small>Estado: ${escapeHTML(getStatusText(claim.status))}</small>
                `);
            
            markers[claimId] = marker;
        });
        
        // Ajustar la vista para mostrar todos los marcadores
        if (Object.keys(markers).length > 0) {
            const markerGroup = new L.featureGroup(Object.values(markers));
            map.fitBounds(markerGroup.getBounds().pad(0.2));
        }
    } catch (error) {
        console.error('Error al actualizar marcadores:', error);
    }
}

// Funciones de navegación
function goBack() {
    try {
        if (document.getElementById('terms-screen')?.classList.contains('active') ||
            document.getElementById('privacy-screen')?.classList.contains('active') ||
            document.getElementById('manual-screen')?.classList.contains('active')) {
            showScreen('settings-screen');
        } else if (document.getElementById('claim-detail-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('map-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('messages-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('profile-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('settings-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        }
    } catch (error) {
        console.error('Error al volver:', error);
    }
}
function showSection(sectionId) {
    try {
        switch(sectionId) {
            case 'claims':
                showScreen('main-screen');
                break;
            case 'map':
                showScreen('map-screen');
                setTimeout(initMap, 100);
                break;
            case 'messages':
                showScreen('messages-screen');
                break;
            case 'profile':
                loadProfileData();
                showScreen('profile-screen');
                break;
            case 'settings':
                showScreen('settings-screen'); // Esta es la línea que faltaba
                break;
            default:
                showScreen('main-screen');
        }
    } catch (error) {
        console.error('Error al mostrar sección:', error);
    }
}

function loadProfileData() {
    try {
        if (!currentUser) return;
        
        // Actualizar la información del perfil
        document.getElementById('profile-name').textContent = currentUser.fullName;
        document.getElementById('profile-department').textContent = currentUser.department;
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-permissions').textContent = currentUser.permissions.join(', ');
        document.getElementById('profile-claims-count').textContent = currentUser.claims.length;
        
        // Generar iniciales para el avatar
        const initials = currentUser.fullName.split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase();
        document.getElementById('profile-initials').textContent = initials;
        
        // Mostrar la fecha y hora actual como último acceso
        const now = new Date();
        const options = { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        document.getElementById('profile-last-login').textContent = 
            now.toLocaleDateString('es-CL', options);
    } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
    }
}

function openNewClaim() {
    try {
        alert('En una app real, esto abriría un formulario para crear un nuevo reclamo');
    } catch (error) {
        console.error('Error al abrir nuevo reclamo:', error);
    }
}

function openMap() {
    try {
        showScreen('map-screen');
        initMap();
    } catch (error) {
        console.error('Error al abrir mapa:', error);
    }
}

function openCamera() {
    try {
        alert('En una app real, esto abriría la cámara del dispositivo');
    } catch (error) {
        console.error('Error al abrir cámara:', error);
    }
}

// Funciones para el chat (DIMAO Conecta)
function sendMessage() {
    try {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !messageInput.value.trim()) return;
        
        const messageText = messageInput.value.trim();
        messageInput.value = '';
        
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-author">${currentUser.fullName}</span>
                <span class="message-time">${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="message-content">${escapeHTML(messageText)}</div>
        `;
        
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Simular respuesta automática
        setTimeout(() => {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'message received';
            responseDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-author">Sistema DIMAO</span>
                    <span class="message-time">${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div class="message-content">Gracias por tu mensaje. Hemos registrado tu comunicación.</div>
            `;
            messagesArea.appendChild(responseDiv);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 1000);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
}

// Funciones de seguridad
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Permitir login con Enter
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    attemptLogin();
                }
            });
        }
        
        // Mostrar pantalla de login inicialmente
        showScreen('login-screen');
        
        // Monitorear estado de conexión
        window.addEventListener('online', () => {
            isOnline = true;
            console.log('Conectado a internet');
        });
        
        window.addEventListener('offline', () => {
            isOnline = false;
            console.log('Sin conexión a internet');
            showOfflineWarning();
        });
        
        // Configurar el input de mensajes para enviar con Enter
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    } catch (error) {
        console.error('Error en DOMContentLoaded:', error);
    }
});

// PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
// ===== MODO OSCURO =====
let darkMode = false;

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
    
    const darkModeBtn = document.getElementById('dark-mode-btn');
    if (darkModeBtn) {
        darkModeBtn.textContent = darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }
}

// ===== TEXTO A VOZ =====
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-CL';
        speechSynthesis.speak(utterance);
    } else {
        console.warn("API de texto a voz no soportada");
    }
}

function speakCurrentClaim() {
    if (!currentClaim) return;
    const text = `Reclamo de ${currentClaim.type}. Descripción: ${currentClaim.description}. 
                 Estado: ${getStatusText(currentClaim.status)}. Dirección: ${currentClaim.address}`;
    speakText(text);
}

// ===== AUTENTICACIÓN BIOMÉTRICA =====
async function attemptBiometricLogin() {
    if (!navigator.credentials || !navigator.credentials.get) {
        showError("Autenticación biométrica no soportada");
        return false;
    }

    try {
        const credential = await navigator.credentials.get({
            mediation: 'required',
            publicKey: {
                challenge: new Uint8Array(32),
                rpId: window.location.hostname,
                userVerification: 'required'
            }
        });
        
        if (credential) {
            const user = users.find(u => u.username === credential.id);
            if (user) {
                loginSuccess(user);
                return true;
            }
        }
    } catch (error) {
        console.error("Error en autenticación biométrica:", error);
        showError("Fallo en autenticación biométrica");
    }
    return false;
}

// ===== CÁMARA Y ARCHIVOS =====
async function addPhotoToClaim() {
    if (!currentClaim) return;

    try {
        // Crear elementos de la interfaz de cámara
        const cameraUI = document.createElement('div');
        cameraUI.className = 'camera-preview';
        cameraUI.innerHTML = `
            <video autoplay playsinline></video>
            <button class="close-camera" onclick="closeCamera()">×</button>
            <div class="camera-controls">
                <button class="capture-btn" onclick="capturePhoto()"></button>
                <input type="file" id="file-input" accept="image/*" style="display: none;">
                <button class="gallery-btn" onclick="document.getElementById('file-input').click()">📁</button>
            </div>
        `;
        document.body.appendChild(cameraUI);

        // Acceder a la cámara
        const video = cameraUI.querySelector('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // Manejar selección de archivo
        document.getElementById('file-input').onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const photoData = await readFileAsDataURL(file);
                savePhotoToClaim(photoData);
                closeCamera();
            }
        };

    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        showError("No se pudo acceder a la cámara");
        closeCamera();
    }
}

function closeCamera() {
    const cameraUI = document.querySelector('.camera-preview');
    if (cameraUI) {
        const video = cameraUI.querySelector('video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        cameraUI.remove();
    }
}

async function capturePhoto() {
    const video = document.querySelector('.camera-preview video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg');
    savePhotoToClaim(photoData);
    closeCamera();
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function savePhotoToClaim(photoData) {
    const newPhotoName = `photo-${Date.now()}.jpg`;
    currentClaim.photos.push(newPhotoName);
    claimsDatabase[currentClaim.id].photos = currentClaim.photos;
    
    // Guardar en localStorage (en producción usar IndexedDB)
    localStorage.setItem(`photo_${currentClaim.id}_${newPhotoName}`, photoData);
    
    // Actualizar UI
    openClaimDetail(currentClaim.id);
}

// ===== WIDGETS (PWA) =====
// Añadir al manifest.json (ver más abajo)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('ServiceWorker registrado');
    });
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Cargar modo oscuro
    const savedMode = localStorage.getItem('darkMode') === 'true';
    if (savedMode) toggleDarkMode();
    
    // Ocultar botón biométrico si no es soportado
    if (!navigator.credentials) {
        const bioBtn = document.getElementById('biometric-login');
        if (bioBtn) bioBtn.style.display = 'none';
    }

    // Verificar si hay sesión guardada
    const savedSession = localStorage.getItem('currentUser');
    if (savedSession) {
        const session = JSON.parse(savedSession);
        const user = users.find(u => u.username === session.username);
        if (user) {
            loginSuccess(user);
            
            // Cargar configuración guardada
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                applySettings(JSON.parse(savedSettings));
                
                // Actualizar controles de UI
                const settings = JSON.parse(savedSettings);
                document.getElementById('notify-new-claims').checked = settings.notifications.newClaims;
                document.getElementById('notify-status-changes').checked = settings.notifications.statusChanges;
                document.getElementById('notify-messages').checked = settings.notifications.messages;
                document.getElementById('font-size').value = settings.accessibility.fontSize;
                document.getElementById('color-scheme').value = settings.accessibility.colorScheme;
            }
            return;
        }
    }
    
    // Permitir login con Enter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptLogin();
            }
        });
    }
    
    // Mostrar pantalla de login inicialmente
    showScreen('login-screen');
    
    // Monitorear estado de conexión
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('Conectado a internet');
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        console.log('Sin conexión a internet');
        showOfflineWarning();
    });
    
    // Configurar el input de mensajes para enviar con Enter
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
let qrScannerActive = false;
let currentStream = null;
let cameras = [];
let currentCameraIndex = 0;

function openQRScanner() {
  const modal = document.getElementById('qr-scanner-modal');
  modal.showModal();
  startQRScanner();
  
  // Event listeners para los botones
  document.getElementById('qr-close').addEventListener('click', closeQRScanner);
  document.getElementById('qr-toggle').addEventListener('click', toggleCamera);
}

async function startQRScanner() {
  const video = document.getElementById('qr-video');
  qrScannerActive = true;
  
  try {
    // Obtener dispositivos de cámara
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter(device => device.kind === 'videoinput');
    
    // Configurar stream de video
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    video.play();
    
    // Iniciar detección QR
    scanQRCode(video);
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    showError("No se pudo acceder a la cámara. Asegúrate de permitir los permisos.");
    closeQRScanner();
  }
}

function scanQRCode(video) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  function tick() {
    if (!qrScannerActive) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        handleQRScan(code.data);
      }
    }
    
    requestAnimationFrame(tick);
  }
  
  tick();
}

function handleQRScan(data) {
  try {
    const claimId = parseInt(data);
    if (claimsDatabase[claimId]) {
      // Cierra el scanner y abre el reclamo
      closeQRScanner();
      openClaimDetail(claimId);
    } else {
      showError("Código QR no válido");
    }
  } catch (e) {
    showError("Error al leer el código QR");
  }
}

async function toggleCamera() {
  if (cameras.length < 2) return;
  
  currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
  await restartCamera();
}

async function restartCamera() {
  const video = document.getElementById('qr-video');
  
  // Detener stream actual
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  
  // Iniciar nueva cámara
  const constraints = {
    video: {
      deviceId: { exact: cameras[currentCameraIndex].deviceId },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };
  
  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (error) {
    console.error("Error al cambiar cámara:", error);
  }
}

function closeQRScanner() {
  qrScannerActive = false;
  const modal = document.getElementById('qr-scanner-modal');
  modal.close();
  
  // Detener stream de video
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  // Limpiar video
  const video = document.getElementById('qr-video');
  video.srcObject = null;
}

// Añadir botón QR en tu interfaz (ej. en quick-actions)
function addQRButton() {
  const quickActions = document.querySelector('.quick-actions');
  if (quickActions) {
    const qrBtn = document.createElement('button');
    qrBtn.className = 'action-btn';
    qrBtn.innerHTML = '<span>🔍</span>Escanear QR';
    qrBtn.onclick = openQRScanner;
    quickActions.appendChild(qrBtn);
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', addQRButton);
// Enviar notificaciones a wearables
function sendToWearable(claimId, action) {
    if ('navigator.bluetooth' in window) {
      navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate']
      })
      .then(device => {
        console.log(`Enviando reclamo ${claimId} a wearable: ${device.name}`);
        // Simular envío (en producción usar API del fabricante)
        showNotification(`Reclamo ${action} sincronizado con ${device.name}`);
      })
      .catch(error => console.error("Error con wearable:", error));
    }
  }
  
  // Modificar changeClaimStatus para incluir wearable
  function changeClaimStatus(newStatus) {
    // ... (código existente)
    if (newStatus === 'completed') {
      sendToWearable(currentClaim.id, 'completado');
    }
  }
  function showReassignDialog(claimId) {
    if (!currentUser.permissions.includes('reassign_claims')) {
      showError("No tienes permiso para reasignar");
      return;
    }
    
    const dialog = document.getElementById('reassign-dialog');
    document.getElementById('reassign-claim-id').textContent = claimId;
    dialog.showModal();
  }
  
  function reassignClaim() {
    const claimId = parseInt(document.getElementById('reassign-claim-id').textContent);
    const newWorker = document.getElementById('worker-select').value;
    
    claimsDatabase[claimId].assignedTo = newWorker;
    console.log(`Reclamo ${claimId} reasignado a ${newWorker}`);
    
    document.getElementById('reassign-dialog').close();
    loadUserClaims(); // Actualizar lista
  }

  // Función para abrir documentos
  function openDocument(docType) {
    try {
        // Mostrar la pantalla correspondiente primero
        showScreen(docType + '-screen');
        
        // Luego cargar el contenido
        const contentElement = document.querySelector(`#${docType}-screen .document-content`);
        if (!contentElement) return;

        let content = '';
        switch (docType) {
            case 'terms':
                content = getTermsContent();
                break;
            case 'privacy':
                content = getPrivacyContent();
                break;
            case 'manual':
                content = getManualContent();
                break;
            default:
                return;
        }

        contentElement.innerHTML = content;
    } catch (error) {
        console.error(`Error al abrir documento ${docType}:`, error);
        showError('Error al cargar el documento');
    }
}

// Funciones para generar el contenido de los documentos
function getTermsContent() {
    return `
        <h4>1. Aceptación de los Términos</h4>
        <div class="document-content">
   <p>Jurisdicción: como representante autorizado de la Municipalidad de Arica, establece que al utilizar la aplicación DIMAO Móvil, usted acepta cumplir integralmente con estos términos y condiciones, los cuales regulan el acceso y uso de esta plataforma oficial.</p>
    
   <p>Uso exclusivo: Esta aplicación está destinada únicamente a funcionarios municipales autorizados, quienes deben seguir estrictamente los protocolos definidos para el manejo de información confidencial y reporte de incidentes.</p>

<p>Integridad garantizada: El sistema registra de manera exhaustiva todas las acciones realizadas (accesos, modificaciones, adjuntos multimedia) para asegurar transparencia y trazabilidad en los procesos.</p>

<p>Implementado, este sistema garantiza trazabilidad completa de todas las acciones realizadas, incluyendo registro de usuarios, modificaciones a reclamos y adjuntos multimedia, para mantener transparencia en los procesos municipales.</p>

<p>Obligaciones del usuario: establece que cada funcionario es responsable de la veracidad de la información ingresada, debiendo reportar inmediatamente cualquier inconsistencia o uso no autorizado detectado en el sistema.</p>

<p>Responsabilidades: De acuerdo con las políticas, los usuarios deben mantener la confidencialidad de sus credenciales y notificar cualquier vulneración de seguridad dentro de un plazo máximo de 24 horas desde su detección.</p>

<p>Barreras de seguridad: La plataforma incorpora medidas avanzadas como autenticación biométrica y encriptación de datos para resguardar la información sensible.</p>

<p>Acceso restringido: especifica que cada departamento municipal tendrá permisos diferenciados según sus funciones específicas, garantizando el principio de mínimo privilegio en el manejo de información.</p>

<p>Registro de actividades: El sistema desarrollado mantendrá un historial completo de todas las acciones realizadas, incluyendo fecha, hora, usuario y tipo de operación, para auditoría posterior.</p>

<p>Efectos por incumplimiento: establece que las violaciones a estos términos podrán resultar en suspensión inmediata del acceso, sin perjuicio de otras acciones disciplinarias o legales que correspondan.</p>

<p>Requisitos técnicos: indica que los usuarios deben disponer de dispositivos compatibles con las últimas actualizaciones de seguridad para garantizar la integridad del sistema.</p>

<p>Actualizaciones normativas: se reserva el derecho de modificar estos términos cuando sea necesario, notificando previamente a los usuarios sobre cambios significativos en las políticas de uso.</p>

<p>Derechos reservados: Toda la información generada en la aplicación es propiedad exclusiva de la Municipalidad de Arica, prohibiéndose su reproducción no autorizada.</p>

<p>Índice de control: supervisará periódicamente la adherencia a estos términos, generando reportes estadísticos para evaluar el uso adecuado de la plataforma.</p>

<p>Apoyo técnico: Canales dedicados estarán disponibles para reportar fallas o solicitar capacitación sobre el funcionamiento de la aplicación.</p>

<p>Zonas de cobertura: especifica que la aplicación está diseñada para operar principalmente dentro del territorio de la comuna de Arica, pudiendo presentar limitaciones funcionales fuera de esta área.</p>
</div>
        
        <h4>1. Recopilación de Datos</h4>
<p>Recopilamos información necesaria para el funcionamiento de la aplicación, incluyendo:</p>

<h5>Protección de credenciales:</h5>
<ul>
    <li>No compartir contraseñas, códigos de verificación o métodos de autenticación biométrica con terceros.</li>
    <li>No almacenar credenciales en dispositivos no autorizados o en formatos inseguros.</li>
</ul>

<h5>Restricciones de uso:</h5>
<ul>
    <li>Utilizar la aplicación solo para fines laborales asociados a sus funciones municipales.</li>
    <li>No acceder a datos, módulos o funcionalidades fuera de su ámbito de autorización (principio de mínimo privilegio).</li>
</ul>

<h5>Seguridad del dispositivo:</h5>
<ul>
    <li>Bloquear el dispositivo móvil con PIN, patrón o biometría cuando no esté en uso.</li>
    <li>Instalar actualizaciones de seguridad del sistema operativo y de la aplicación inmediatamente cuando estén disponibles.</li>
</ul>

<h5>Contenido y multimedia:</h5>
<ul>
    <li>Subir únicamente archivos (fotos, videos, documentos) directamente relacionados con reportes o gestiones municipales.</li>
    <li>No adjuntar material sensible innecesario (ej: datos personales de terceros sin consentimiento).</li>
</ul>

<h5>Prohibiciones explícitas:</h5>
<ul>
    <li>No realizar ingeniería inversa, modificar el código o alterar el funcionamiento de la aplicación.</li>
    <li>No falsificar información, ubicaciones o identidades en los reportes.</li>
</ul>


    `;
}

function getPrivacyContent() {
    return `
        <h4>1. Recopilación de Datos</h4>
        <p>Recopilamos información necesaria para el funcionamiento de la aplicación, incluyendo:</p>
        <ul>
            <li>Datos de usuario (nombre, departamento)</li>
            <li>Registro de actividades en la aplicación</li>
        </ul>
        
        <h4>2. Uso de los Datos</h4>
        <p>Los datos se utilizan exclusivamente para:</p>
        <ul>
            <li>Gestión de reclamos municipales</li>
            <li>Mejora de servicios</li>
            <li>Comunicación interna</li>
        </ul>
    `;
}

function getManualContent() {
    return `
        <div class="video-container">
            <h3>Video Tutorial</h3>
             <div class="youtube-embed">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/watch?v=-JGVuqxSlBA&list=RD-JGVuqxSlBA&start_radio=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <video width="100%" controls poster="thumbnail.jpg">
                <source src="video_tutorial.mp4" type="video/mp4">
                Tu navegador no soporta videos HTML5. Descárgalo <a href="video_tutorial.mp4">aquí</a>.
            </video>
            <p class="video-description">Vea este tutorial rápido antes de comenzar</p>
        </div>

        <h4>1. Inicio de Sesión</h4>
        <p>Para acceder a la aplicación:</p>
        <ol>
            <li>Ingrese su nombre de usuario y contraseña</li>
            <li>Presione el botón "Iniciar Sesión"</li>
        </ol>
        
        <h4>2. Gestión de Reclamos</h4>
        <p>Para actualizar el estado de un reclamo:</p>
        <ol>
            <li>Seleccione el reclamo de la lista</li>
            <li>Presione el botón de estado correspondiente</li>
        </ol>
        
        <h4>3. Soporte Técnico</h4>
        <p>Para reportar problemas:</p>
        <ul>
            <li>Contacte al equipo de desarrollo</li>
            <li>Proporcione detalles del error</li>
        </ul>

        <style>
            .video-container {
                margin: 20px 0;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .video-description {
                padding: 10px;
                background: #f5f5f5;
                margin: 0;
                font-size: 0.9em;
                color: #666;
            }
        </style>
    `;
}