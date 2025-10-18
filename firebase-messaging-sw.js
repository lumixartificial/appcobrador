const SW_VERSION = "v8.0-reset-total"; // Versión final para forzar la actualización

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

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

console.log(`[SW-COBRADOR] Service Worker ${SW_VERSION} cargado.`);

messaging.onBackgroundMessage((payload) => {
  console.log(`[SW-COBRADOR] Mensaje en segundo plano recibido.`, payload);

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

self.addEventListener('notificationclick', (event) => {
    const LOG_PREFIX = `[SW-COBRADOR-CLICK ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} Clic en notificación recibido.`);
    
    event.notification.close();

    const targetUrl = event.notification.data.url || new URL('/', self.location.origin).href;
    console.log(`${LOG_PREFIX} URL de destino: ${targetUrl}`);

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        // Opción 1: Buscar una ventana que ya esté en la URL correcta.
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);
        if (existingClient) {
            console.log(`${LOG_PREFIX} Ventana existente con URL correcta encontrada. Enfocando...`);
            return existingClient.focus();
        }

        // Opción 2: Si no se encontró, pero hay CUALQUIER ventana de la app abierta,
        // la reutilizamos, sin importar en qué pantalla esté.
        if (windowClients.length > 0) {
            console.log(`${LOG_PREFIX} Otra ventana de la app está abierta. Reutilizando y enfocando...`);
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // Opción 3: Si no hay absolutamente ninguna ventana abierta, abre una nueva.
        console.log(`${LOG_PREFIX} Ninguna ventana de la app encontrada. Abriendo una nueva.`);
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});
