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

const SW_VERSION = "v1.5-direct-open"; // Nueva versión para depuración
console.log(`Service Worker ${SW_VERSION} cargado.`);

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
        // --- CAMBIO #1: Etiqueta única para cada notificación ---
        tag: `lumix-notification-${Date.now()}`,
        data: {
            url: targetUrl.href
        },
        actions: [
            { action: 'open_app', title: 'Abrir Aplicativo' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- CAMBIO #2: Lógica de clic simplificada y más robusta ---
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Evento 'notificationclick' DETECTADO.`);
    event.notification.close();

    const targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos. No se puede abrir la ventana.`);
        return;
    }

    // En lugar de buscar ventanas existentes, abrimos una nueva directamente.
    // Esto es más confiable en todos los navegadores.
    const promiseChain = clients.openWindow(targetUrl).then(windowClient => {
        if (windowClient) {
            console.log(`[SW ${SW_VERSION}] Ventana abierta o enfocada con éxito.`);
            return windowClient.focus();
        } else {
            console.log(`[SW ${SW_VERSION}] No se pudo abrir la ventana.`);
        }
    }).catch(err => {
        console.error(`[SW ${SW_VERSION}] Error al intentar abrir la ventana:`, err);
    });

    event.waitUntil(promiseChain);
});





