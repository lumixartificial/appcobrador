importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// La configuración es una copia exacta de la del index.html para asegurar consistencia.
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

const LOG_PREFIX = `[SW-COBRADOR-RESTAURADO v11.0]`;
console.log(`${LOG_PREFIX} Service Worker iniciado. Este es el código de restauración.`);

// Handler para recibir mensajes cuando la app está en segundo plano.
// Este es el núcleo del sistema de notificaciones push.
messaging.onBackgroundMessage((payload) => {
    console.log(`${LOG_PREFIX} Mensaje PUSH recibido en segundo plano:`, payload);

    if (!payload.data || !payload.data.title) {
        console.error(`${LOG_PREFIX} El payload del mensaje no tiene el formato esperado (data.title).`, payload);
        return;
    }

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        // La URL a la que se debe navegar se guarda en el campo 'data'.
        data: { url: payload.data.url } 
    };
  
    console.log(`${LOG_PREFIX} Mostrando notificación: "${notificationTitle}"`);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener para el evento 'notificationclick'. Lógica blindada para abrir la app.
self.addEventListener('notificationclick', (event) => {
    console.log(`${LOG_PREFIX} Clic en notificación detectado.`);
    event.notification.close();

    const targetUrl = event.notification.data.url || self.location.origin;

    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((windowClients) => {
        // 1. Busca una ventana que ya esté en la URL correcta.
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);
        if (existingClient) {
            console.log(`${LOG_PREFIX} Ventana existente encontrada. Enfocando...`);
            return existingClient.focus();
        }

        // 2. Si no, reutiliza cualquier ventana abierta de la app.
        if (windowClients.length > 0) {
            console.log(`${LOG_PREFIX} Otra ventana de la app está abierta. Navegando y enfocando...`);
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // 3. Si no hay ninguna, abre una nueva.
        console.log(`${LOG_PREFIX} Ninguna ventana de la app encontrada. Abriendo una nueva.`);
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});


// Se asegura de que esta nueva versión se active inmediatamente.
self.addEventListener('install', (event) => {
  console.log(`${LOG_PREFIX} Instalando la versión de restauración...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`${LOG_PREFIX} Activado y tomando el control.`);
  event.waitUntil(self.clients.claim());
});
