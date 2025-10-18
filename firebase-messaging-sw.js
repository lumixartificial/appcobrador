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

// Se inicializa Firebase con la sintaxis CORRECTA para un Service Worker.
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging.getMessaging(app);

console.log('[SW-COBRADOR v10.0] Service Worker inicializado y listo.');

// Handler para mensajes recibidos cuando la app está en segundo plano o cerrada.
// ESTA ES LA FUNCIÓN CLAVE PARA RECIBIR NOTIFICACIONES PUSH.
firebase.messaging.onBackgroundMessage(messaging, (payload) => {
    console.log('[SW-COBRADOR v10.0] ¡Mensaje Push recibido en segundo plano!', payload);

    if (!payload.data || !payload.data.title) {
        console.error('[SW-COBRADOR v10.0] El payload recibido no tiene el formato esperado (payload.data.title).', payload);
        return;
    }

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        data: {
            url: payload.data.url || '/'
        }
    };

    console.log(`[SW-COBRADOR v10.0] Mostrando notificación: "${notificationTitle}"`);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener para el evento 'notificationclick'. ESTA ES LA LÓGICA MÁS IMPORTANTE.
self.addEventListener('notificationclick', (event) => {
    console.log('[SW-COBRADOR v10.0] Clic en notificación detectado.', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;
    console.log(`[SW-COBRADOR v10.0] URL de destino: ${targetUrl}`);

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;
        for (const client of windowClients) {
            if (client.url === targetUrl && 'focus' in client) {
                matchingClient = client;
                break;
            }
        }

        if (matchingClient) {
            console.log('[SW-COBRADOR v10.0] Ventana existente encontrada en la URL correcta. Enfocando...');
            return matchingClient.focus();
        }

        if (windowClients.length > 0) {
            console.log('[SW-COBRADOR v10.0] Otra ventana de la app está abierta. Navegando y enfocando...');
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        console.log('[SW-COBRADOR v10.0] Ninguna ventana de la app encontrada. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});

self.addEventListener('install', (event) => {
  console.log('[SW-COBRADOR v10.0] Instalando la versión definitiva...');
  event.waitUntil(self.skipWaiting()); 
});

self.addEventListener('activate', (event) => {
  console.log('[SW-COBRADOR v10.0] Activando y tomando el control de la página...');
  event.waitUntil(self.clients.claim());
});

