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
        if (document.getElementById('claim-detail-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('map-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('messages-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('profile-screen')?.classList.contains('active')) {
            showScreen('main-screen');
        } else if (document.getElementById('settings-screen')?.classList.contains('active')) {
            showScreen('main-screen'); // Esta es la línea que faltaba
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
});