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
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Este manejador está funcionando correctamente.
messaging.onBackgroundMessage((payload) => {
    console.log("[SW ULTIMATE] Mensaje recibido: ", payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cobrador-notification', // Evita notificaciones duplicadas
        data: {
            // Guardamos la URL completa y absoluta a la que debemos navegar.
            url: new URL('/#notifications', self.location.origin).href
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [LÓGICA DE CLIC FINAL Y SIMPLIFICADA]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW ULTIMATE] Notificación clickeada:', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;

    // Esta es la forma más directa y compatible de abrir la ventana.
    // Si la app ya está abierta, la enfoca. Si no, la abre.
    // Es una sola acción, lo que reduce la posibilidad de error.
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url === targetUrl && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});


