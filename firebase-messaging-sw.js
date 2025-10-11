// firebase-messaging-sw.js
// Version: 1.7 (Incrementa este número para forzar actualizaciones)
// Importa los scripts de Firebase
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// IMPORTANTE: Usa exactamente la misma configuración de Firebase que tienes en tu app
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// --- INICIALIZACIÓN DE FIREBASE ---
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
console.log('[SW] Service Worker de Firebase inicializado.');

// --- MANEJADOR DE MENSAJES EN SEGUNDO PLANO ---
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Mensaje recibido en segundo plano. Payload:", payload);

  // --- CÓDIGO A PRUEBA DE ERRORES ---
  // Verificamos que 'payload.data' exista para evitar fallos.
  if (!payload.data) {
    console.error('[SW] El payload no contiene la sección "data". No se puede mostrar la notificación.');
    return;
  }
  
  // Asignamos valores por defecto a cada parte de la notificación.
  // Esto previene que el script falle si alguna información no llega desde el servidor.
  const notificationTitle = payload.data.title || "Nova Notificação";
  const notificationOptions = {
    body: payload.data.body || "Você tem uma nova atividade.",
    icon: payload.data.icon || "https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png",
    badge: "https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png", // Ícono para la barra de notificaciones de Android
    data: {
        click_action: payload.data.click_action || "https://lumix-financas-app.web.app/cobrador.html" // URL por defecto
    }
  };

  console.log('[SW] Mostrando notificación con Título:', notificationTitle, 'y Opciones:', notificationOptions);
  
  // Mostramos la notificación usando los datos recibidos y nos aseguramos que el Service Worker se mantenga activo.
  return self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- MANEJADOR DE CLICS EN LA NOTIFICACIÓN ---
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Clic en notificación recibido:', event.notification);
    
    // Cierra la notificación al ser presionada.
    event.notification.close(); 
    
    const urlToOpen = event.notification.data.click_action;
    
    if (urlToOpen) {
        console.log('[SW] Intentando abrir o enfocar URL:', urlToOpen);
        // Busca si ya hay una ventana de la app abierta y la enfoca. Si no, abre una nueva.
        const promiseChain = clients.matchAll({
            type: "window",
            includeUncontrolled: true // Importante para encontrar clientes de inmediato
        }).then(windowClients => {
            let matchingClient = null;
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen) {
                    matchingClient = client;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        });
        event.waitUntil(promiseChain);
    }
});








