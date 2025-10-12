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
        // [CAMBIO CLAVE #1] - Almacenamos una ruta relativa simple, sin './'.
        // Esto es más limpio y menos propenso a errores de interpretación.
        data: {
            url: 'app_cobrador.html#notifications'
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// [CÓDIGO FINAL Y DEFINITIVO] - Manejador de clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificación clickeada.');
    event.notification.close();

    // [CAMBIO CLAVE #2] - Construimos la URL de destino de la forma más robusta posible.
    // `self.registration.scope` es la URL base de la PWA, garantizando que siempre apuntemos al lugar correcto.
    const targetUrl = new URL(event.notification.data.url, self.registration.scope).href;

    // event.waitUntil() asegura que el Service Worker no se termine antes de que la operación se complete.
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // 1. Buscamos si ya hay una ventana de nuestra app abierta.
            for (const client of clientList) {
                // Verificamos si la ventana es del mismo origen (nuestro sitio) y puede ser enfocada.
                if (new URL(client.url).origin === new URL(self.registration.scope).origin && 'focus' in client) {
                    console.log('App ya está abierta, navegando a la sección y enfocando.', targetUrl);
                    // Si la encontramos, la dirigimos a la URL correcta (la pestaña de notificaciones).
                    client.navigate(targetUrl);
                    // Y lo más importante, la traemos al frente para que el usuario la vea.
                    return client.focus();
                }
            }
            
            // 2. Si el bucle termina y no encontró ninguna ventana, significa que la app está cerrada.
            if (clients.openWindow) {
                console.log('App está cerrada, abriendo una nueva ventana.', targetUrl);
                // Abrimos una nueva ventana directamente en la URL de destino.
                return clients.openWindow(targetUrl);
            }
        })
    );
});



