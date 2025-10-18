importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Se inicializa Firebase con la sintaxis MODERNA.
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging.getMessaging(app);

// Handler para mensajes recibidos cuando la app está en segundo plano o cerrada.
firebase.messaging.onBackgroundMessage(messaging, (payload) => {
    console.log('[SW-COBRADOR v9.0] Mensaje en segundo plano recibido:', payload);

    // Se extraen los datos del payload.data, que es el método robusto.
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        // La URL de destino se guarda en el campo 'data' de la notificación.
        data: {
            url: payload.data.url 
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener para el evento 'notificationclick'.
self.addEventListener('notificationclick', (event) => {
    console.log('[SW-COBRADOR v9.0] Clic en notificación detectado.');
    event.notification.close();

    const targetUrl = event.notification.data.url || '/';

    // Lógica robusta para abrir o enfocar la ventana de la app.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // 1. Si ya hay una ventana abierta, la enfoca y la reutiliza.
            for (const client of clientList) {
                // Se verifica si la URL es la misma o si simplemente la ventana es visible, para mayor flexibilidad.
                if (client.url === targetUrl && 'focus' in client) {
                    console.log('[SW-COBRADOR v9.0] Ventana existente encontrada. Enfocando...');
                    return client.focus();
                }
            }
            // 2. Si no hay ventanas abiertas, abre una nueva.
            if (clients.openWindow) {
                console.log('[SW-COBRADOR v9.0] Ninguna ventana encontrada. Abriendo una nueva.');
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// Forzar la activación del nuevo Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW-COBRADOR v9.0] Instalando nueva versión...');
  event.waitUntil(self.skipWaiting()); 
});

self.addEventListener('activate', (event) => {
  console.log('[SW-COBRADOR v9.0] Activando y tomando control...');
  event.waitUntil(self.clients.claim());
});
