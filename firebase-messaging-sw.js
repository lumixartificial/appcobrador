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

const SW_VERSION = "v1.4-actions"; // Para verificar qué versión está activa
console.log(`Service Worker ${SW_VERSION} loaded.`);


messaging.onBackgroundMessage((payload) => {
    console.log(`[SW ${SW_VERSION}] Mensaje de fondo recibido:`, payload);

    const notificationTitle = payload.data?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || 'Você tem uma nova atividade.';
    const appOrigin = self.location.origin;
    const targetUrl = new URL('/#notifications', appOrigin);

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-notification-tag',
        data: {
            url: targetUrl.href
        },
        // --- LA SOLUCIÓN CLAVE ---
        // Agregar 'actions' fuerza al navegador a tratar la notificación como interactiva,
        // lo que hace que el evento 'notificationclick' sea mucho más confiable.
        actions: [
            { action: 'open_app', title: 'Abrir Aplicativo' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Notificación clickeada. Acción:`, event.action);
    event.notification.close(); // Cierra la notificación

    const targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos de la notificación.`);
        return;
    }

    // Lógica para encontrar y enfocar la ventana existente o abrir una nueva.
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (new URL(windowClient.url).origin === new URL(targetUrl).origin && 'focus' in windowClient) {
                console.log(`[SW ${SW_VERSION}] App ya abierta. Navegando y enfocando.`);
                return windowClient.navigate(targetUrl).then(client => client.focus());
            }
        }

        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] App no encontrada. Abriendo nueva ventana.`);
            return clients.openWindow(targetUrl);
        }
    }).catch(err => {
        console.error(`[SW ${SW_VERSION}] Error al manejar el clic en la notificación:`, err);
    });

    event.waitUntil(promiseChain);
});




