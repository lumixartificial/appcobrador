const SW_VERSION = "v6.0-definitivo"; // Versión final y estable

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// [CORRECCIÓN FINAL] Configuración de Firebase verificada para ser 100% idéntica a la de app_cobrador/index.html
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
  const LOG_PREFIX = `[SW-COBRADOR-DIAGNOSTICO ${SW_VERSION}]`;
  console.log(`${LOG_PREFIX} Mensaje en segundo plano recibido.`, payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    tag: 'lumix-cobrador-notification', 
    data: { url: payload.data.url || self.location.origin }
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

// [LÓGICA FINAL Y FUNCIONAL] Exactamente la misma lógica que funciona en la app del cliente.
self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    console.log(`[SW-COBRADOR ${SW_VERSION}] Clic detectado. URL de destino: ${targetUrl}`);
    event.notification.close();

    const promiseChain = clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then((windowClients) => {
        // 1. Busca si ya hay una ventana abierta y visible con la misma URL.
        const existingClient = windowClients.find(client => client.url === targetUrl && 'focus' in client);

        if (existingClient) {
            console.log(`[SW-COBRADOR ${SW_VERSION}] Ventana existente encontrada. Enfocando...`);
            return existingClient.focus();
        }

        // 2. Si no, busca cualquier otra ventana de la app (incluso en segundo plano) para reutilizarla.
        if (windowClients.length > 0) {
            console.log(`[SW-COBRADOR ${SW_VERSION}] Ventana en segundo plano encontrada. Navegando y enfocando...`);
            return windowClients[0].navigate(targetUrl).then(client => client.focus());
        }
        
        // 3. Si no hay ninguna ventana abierta, abre una nueva.
        console.log(`[SW-COBRADOR ${SW_VERSION}] Ninguna ventana abierta. Abriendo una nueva.`);
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});

