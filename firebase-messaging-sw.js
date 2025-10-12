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

messaging.onBackgroundMessage((payload) => {
    console.log("[SW CORREGIDO] Mensaje recibido: ", payload);
    
    // [CORRECCIÓN FINAL ANTI-CRASH] - Lee el título y el cuerpo de 'data' O de 'notification'.
    // El '?' (optional chaining) evita el error si 'data' o 'notification' no existen.
    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cobrador-notification', // Evita notificaciones duplicadas
        data: {
            // Guardamos la URL completa y absoluta a la que debemos navegar.
            url: new URL('#notifications', self.location.origin).href
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [LÓGICA DE CLIC FINAL]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW CORREGIDO] Notificación clickeada:', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // Revisa si ya hay una ventana de la app abierta.
        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            // Si encontramos la app, la enfocamos y la dirigimos a la URL.
            if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
                console.log("[SW CORREGIDO] App encontrada, enfocando y navegando.");
                return client.focus().then(c => c.navigate(targetUrl));
            }
        }
        // Si no hay ninguna ventana abierta, abrimos una nueva.
        if (clients.openWindow) {
            console.log("[SW CORREGIDO] App no encontrada, abriendo nueva ventana.");
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
