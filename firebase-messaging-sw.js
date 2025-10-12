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

// [SIN CAMBIOS] - Este manejador se activa cuando llega una notificación con la app en segundo plano.
// Tu lógica original para mostrar la notificación se mantiene intacta.
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ", payload);

    // Extraemos la información del payload "data"
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || '/favicon.ico', // Un ícono por defecto
        badge: '/badge-icon.png', // Ícono para la barra de notificaciones de Android
        // Es importante pasar los datos a la notificación para usarlos en el 'click'
        data: {
            url: '/#notifications' // URL a la que queremos navegar
        }
    };

    // Mostramos la notificación
    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// [CÓDIGO ACTUALIZADO] - Este manejador se activa cuando el usuario hace clic en la notificación.
// Esta es la sección que ha sido mejorada para abrir o enfocar la app.
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificación clickeada.');

    // Cierra la notificación para que no se quede en la barra
    event.notification.close();

    // La URL a la que queremos ir dentro de la app (la pestaña de notificaciones).
    const targetUrl = new URL(event.notification.data.url, self.location.origin).href;

    // event.waitUntil() asegura que el navegador no termine el service worker
    // antes de que nuestra operación de abrir la ventana se complete.
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true // Asegura que busquemos en todas las pestañas
        }).then((clientList) => {
            // Revisa si alguna de las pestañas abiertas ya corresponde a nuestra app
            for (const client of clientList) {
                // Si encontramos una pestaña abierta de nuestra app y se puede "enfocar"
                if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
                    // ¡La app ya está abierta!
                    // Primero, la dirigimos a la sección de notificaciones
                    client.navigate(targetUrl);
                    // Y luego la traemos al frente para que el usuario la vea.
                    return client.focus();
                }
            }
            // Si el bucle termina sin encontrar una pestaña abierta, abrimos una nueva.
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});


