const SW_VERSION = "v6.0-enfoque-definitivo"; // Versión actualizada para forzar la actualización

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

// --- SOLUCIÓN VERDADERA Y DEFINITIVA ---
self.addEventListener('notificationclick', (event) => {
    const LOG_PREFIX = `[SW-COBRADOR-CLICK ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} Clic en notificación recibido.`, event.notification);
    
    // Cierra la notificación visualmente.
    event.notification.close();

    // Obtiene la URL de destino desde los datos de la notificación. Si no existe, usa la raíz de la app.
    const targetUrl = event.notification.data.url || new URL('/', self.location.origin).href;
    console.log(`${LOG_PREFIX} URL de destino: ${targetUrl}`);

    // La lógica robusta para encontrar y enfocar una ventana existente o abrir una nueva.
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        console.log(`${LOG_PREFIX} Ventanas encontradas: ${windowClients.length}`);
        
        // Busca una ventana que ya esté visible para el usuario.
        let clientToFocus = windowClients.find(client => client.visibilityState === 'visible');

        // Si no hay ninguna visible, toma la primera de la lista (si existe).
        if (!clientToFocus && windowClients.length > 0) {
            clientToFocus = windowClients[0];
        }

        // Si se encontró una ventana para reutilizar...
        if (clientToFocus) {
            console.log(`${LOG_PREFIX} Ventana existente encontrada. Navegando a ${targetUrl} y enfocando.`);
            // Le ordena navegar a la URL correcta y luego la trae al primer plano.
            return clientToFocus.navigate(targetUrl).then(client => client.focus());
        }
        
        // Si no hay ninguna ventana abierta de la app...
        console.log(`${LOG_PREFIX} Ninguna ventana de la app está abierta. Abriendo una nueva en ${targetUrl}.`);
        // Abre una nueva ventana en la URL de destino.
        return clients.openWindow(targetUrl);
    });

    // Espera a que la promesa de abrir/enfocar la ventana se complete.
    event.waitUntil(promiseChain);
});
