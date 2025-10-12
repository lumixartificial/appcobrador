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
    console.log("[SW FINAL-DEFINITIVO] Mensaje recibido: ", payload);

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

// [LÓGICA DE CLIC FINAL Y ROBUSTA]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW FINAL-DEFINITIVO] Notificación clickeada:', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;

    // waitUntil() asegura que el Service Worker no termine antes de que completemos la acción.
    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((clientList) => {
        // 1. Revisa si hay una ventana de la app ya abierta.
        for (const client of clientList) {
            // Busca la primera ventana disponible de nuestra app.
            if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
                console.log("[SW FINAL-DEFINITIVO] App ya está abierta. Navegando y enfocando.");
                // La dirige a la URL correcta y LUEGO la trae al frente.
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }

        // 2. Si no se encontró ninguna ventana, abre una nueva.
        if (clients.openWindow) {
            console.log("[SW FINAL-DEFINITIVO] App no encontrada. Abriendo nueva ventana.");
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});

