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

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejador para notificaciones en segundo plano.
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ", payload);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || '/favicon.ico',
        badge: '/badge-icon.png',
        // [CAMBIO CLAVE #1] - Ya no guardamos una URL completa, solo el "hash"
        // que representa la vista a la que queremos ir (#notifications).
        data: {
            targetHash: '#notifications'
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// [CÓDIGO FINAL REVISADO Y REFORZADO] - Manejador de clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificación clickeada.');
    event.notification.close();

    // [CAMBIO CLAVE #2] - Construimos la URL de la forma más robusta.
    // Usamos `self.registration.scope`, que es la URL base de tu PWA (ej: https://dominio.com/),
    // y le añadimos el hash de destino. Esto siempre abre el punto de entrada correcto de la app.
    const targetHash = event.notification.data.targetHash || '#';
    const targetUrl = new URL(targetHash, self.registration.scope).href;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // 1. Buscamos si la app ya está abierta en alguna pestaña.
            for (const client of clientList) {
                // Comparamos el origen (dominio) para encontrar la ventana correcta.
                if (new URL(client.url).origin === new URL(self.registration.scope).origin && 'focus' in client) {
                    console.log('App ya está abierta, navegando y enfocando:', targetUrl);
                    // Si la encontramos, la dirigimos a la sección de notificaciones.
                    client.navigate(targetUrl);
                    // Y la traemos al frente.
                    return client.focus();
                }
            }
            
            // 2. Si la app está cerrada, abrimos una nueva ventana en su URL principal con el hash.
            if (clients.openWindow) {
                console.log('App está cerrada, abriendo nueva ventana en:', targetUrl);
                return clients.openWindow(targetUrl);
            }
        })
    );
});
