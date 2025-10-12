// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Usa la misma configuración de Firebase de tu app
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

messaging.onBackgroundMessage((payload) => {
    console.log("[SW NUEVO] Mensaje recibido: ", payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cobrador-notification',
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [LÓGICA DE CLIC SIMPLIFICADA AL MÁXIMO]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW NUEVO] Notificación clickeada.');
    event.notification.close();

    // La URL a la que SIEMPRE vamos a ir. Es la raíz de tu app.
    const targetUrl = self.registration.scope;

    // Esta es la forma más simple y directa de abrir la app.
    const promiseChain = clients.openWindow(targetUrl);
    
    event.waitUntil(promiseChain);
});
