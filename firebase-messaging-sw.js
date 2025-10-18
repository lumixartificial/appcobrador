importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Se inicializa Firebase con la sintaxis MODERNA.
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging.getMessaging(app);

const LOG_PREFIX = `[SW-COBRADOR-MODULAR v12.0]`;
console.log(`${LOG_PREFIX} Service Worker reconstruido y sincronizado.`);

// Handler para recibir mensajes push. AHORA es compatible.
firebase.messaging.onBackgroundMessage(messaging, (payload) => {
    console.log(`${LOG_PREFIX} Mensaje PUSH recibido:`, payload);

    if (!payload.data || !payload.data.title) {
        console.error(`${LOG_PREFIX} El payload del mensaje es inválido.`, payload);
        return;
    }

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        tag: 'lumix-cobrador-notification', // Ayuda a agrupar notificaciones
        data: { url: payload.data.url }
    };
  
    console.log(`${LOG_PREFIX} Mostrando notificación: "${notificationTitle}"`);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener para el evento 'notificationclick'. Lógica robusta y validada.
self.addEventListener('notificationclick', (event) => {
    console.log(`${LOG_PREFIX} Clic en notificación detectado.`);
    event.notification.close();

    const targetUrl = event.notification.data.url || self.location.origin;

    event.waitUntil(clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((windowClients) => {
        // 1. Busca una ventana que ya esté en la URL correcta.
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);
        if (existingClient) {
            console.log(`${LOG_PREFIX} Ventana existente encontrada. Enfocando...`);
            return existingClient.focus();
        }

        // 2. Si no, reutiliza cualquier ventana abierta de la app, navegándola a la URL correcta.
        if (windowClients.length > 0) {
            console.log(`${LOG_PREFIX} Otra ventana de la app está abierta. Navegando y enfocando...`);
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // 3. Si no hay ninguna, abre una nueva.
        console.log(`${LOG_PREFIX} Ninguna ventana de la app encontrada. Abriendo una nueva.`);
        return clients.openWindow(targetUrl);
    }));
});

// Forza la activación inmediata de esta nueva versión.
self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} Instalando la versión final...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});
