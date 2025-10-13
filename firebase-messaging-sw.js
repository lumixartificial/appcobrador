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

const SW_VERSION = "v1.6-final-attempt"; // Final version for debugging
console.log(`Service Worker ${SW_VERSION} cargado.`);

messaging.onBackgroundMessage((payload) => {
    console.log(`[SW ${SW_VERSION}] Mensaje de fondo recibido. Payload completo:`, payload);

    // Priorizamos los datos enviados en el 'data' payload, que nos da control total.
    const notificationData = payload.data || {};
    const notificationTitle = notificationData.title || 'Nova Notificação';
    const notificationBody = notificationData.body || 'Você tem uma nova atividade.';
    
    const targetUrl = self.location.origin + '/#notifications';

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: `lumix-notification-${Date.now()}`, // Tag única para evitar problemas de agrupamiento
        data: {
            url: targetUrl
        },
        // --- CAMBIOS CLAVE PARA FORZAR LA INTERACTIVIDAD ---
        actions: [
            { action: 'open_app', title: 'Abrir Aplicativo' }
        ],
        requireInteraction: true // Mantiene la notificación visible hasta que el usuario interactúe
    };
    
    console.log(`[SW ${SW_VERSION}] Mostrando notificación con título: "${notificationTitle}" y opciones:`, notificationOptions);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] EVENTO 'notificationclick' ¡¡¡DETECTADO!!!`);
    console.log(`[SW ${SW_VERSION}] Acción: ${event.action}`);
    
    // Cerramos la notificación inmediatamente
    event.notification.close();

    const targetUrl = event.notification.data.url;
    console.log(`[SW ${SW_VERSION}] URL de destino: ${targetUrl}`);

    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos. No se puede abrir la ventana.`);
        return;
    }

    // Lógica para abrir la ventana. Buscamos una ventana existente para enfocarla.
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        
        for (const client of windowClients) {
            // Compara el origen (https://app.com) en lugar de la URL completa
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Se encontró una ventana abierta. Navegando y enfocando.`);
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        
        // Si no se encontró ninguna ventana, abrimos una nueva.
        console.log(`[SW ${SW_VERSION}] No se encontraron ventanas abiertas. Abriendo una nueva.`);
        return clients.openWindow(targetUrl);

    }).catch(err => {
        console.error(`[SW ${SW_VERSION}] Error al manejar el clic en la notificación:`, err);
    });

    event.waitUntil(promiseChain);
});
