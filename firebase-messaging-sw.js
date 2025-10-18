const SW_VERSION = "v5.4-robusto"; // Versión actualizada

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

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

console.log(`[SW-COBRADOR] Service Worker ${SW_VERSION} cargado.`);

messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-COBRADOR-DIAGNOSTICO ${SW_VERSION}]`;
  console.log(`${LOG_PREFIX} Mensaje en segundo plano recibido.`, payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    tag: 'lumix-cobrador-notification', 
    data: { url: payload.data.url }
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log(`[SW-COBRADOR ${SW_VERSION}] Instalando y forzando activación inmediata.`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-COBRADOR ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});

// [SOLUCIÓN ROBUSTA Y DEFINITIVA]
self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    event.notification.close();

    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((windowClients) => {
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);

        if (existingClient) {
            console.log('[SW-COBRADOR] Ventana existente encontrada. Enfocando...');
            return existingClient.focus();
        }

        if (windowClients.length > 0) {
            console.log('[SW-COBRADOR] Otra ventana de la app está abierta. Navegando y enfocando...');
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        console.log('[SW-COBRADOR] Ninguna ventana abierta. Abriendo una nueva.');
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});


