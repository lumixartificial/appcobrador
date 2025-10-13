// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const SW_VERSION = "v1.7-claim-clients";
console.log(`Service Worker ${SW_VERSION} cargado.`);

// --- CAMBIO #1: Forzar la activación inmediata del nuevo Service Worker ---
self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando nueva versión...`);
  event.waitUntil(self.skipWaiting());
});

// --- CAMBIO #2: El nuevo Service Worker toma control de todas las pestañas ---
self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});


messaging.onBackgroundMessage((payload) => {
    console.log(`[SW ${SW_VERSION}] Mensaje de fondo recibido:`, payload);

    // Este código ahora espera un payload que SÓLO tiene la propiedad 'data'
    const notificationData = payload.data || {};
    const notificationTitle = notificationData.title || 'Nova Notificação';
    const notificationBody = notificationData.body || 'Você tem uma nova atividade.';
    const notificationIcon = notificationData.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png';
    
    const targetUrl = self.location.origin;

    const notificationOptions = {
        body: notificationBody,
        icon: notificationIcon,
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: `lumix-notification-${Date.now()}`,
        data: {
            url: targetUrl
        },
        actions: [ { action: 'open_app', title: 'Abrir Aplicativo' } ],
        requireInteraction: true
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Evento 'notificationclick' DETECTADO.`);
    event.notification.close();

    const targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos.`);
        return;
    }

    // Esta lógica ahora funcionará porque el SW tiene el control
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        for (const client of windowClients) {
            // Si encuentra una pestaña de la app, la enfoca.
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Se encontró una ventana abierta. Enfocando.`);
                return client.focus();
            }
        }
        // Si no hay ninguna pestaña abierta, abre una nueva.
        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] No se encontraron ventanas. Abriendo una nueva.`);
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
