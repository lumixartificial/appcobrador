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

const SW_VERSION = "v1.8-sync-icon";
console.log(`Service Worker ${SW_VERSION} cargado.`);

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando nueva versión...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});


messaging.onBackgroundMessage((payload) => {
    console.log(`[SW ${SW_VERSION}] Mensaje de fondo recibido:`, payload);

    // --- CORRECCIÓN CLAVE PARA USAR LA FOTO DEL CLIENTE ---
    const notificationPayload = payload.notification || {};
    const notificationData = payload.data || {};
    
    const notificationTitle = notificationData.title || notificationPayload.title || 'Nova Notificação';
    const notificationBody = notificationData.body || notificationPayload.body || 'Você tem uma nova atividade.';
    
    // Priorizamos el icono que envía el servidor en el payload 'notification'.
    // Esto asegura que nuestra notificación funcional use la foto del cliente.
    const notificationIcon = notificationPayload.icon || notificationData.profilePictureUrl || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png';
    
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

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        for (const client of windowClients) {
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Se encontró una ventana abierta. Enfocando.`);
                return client.focus();
            }
        }
        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] No se encontraron ventanas. Abriendo una nueva.`);
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
