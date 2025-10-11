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

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Este es el manejador clave: se activa cuando llega una notificación "data-only"
// con la app en segundo plano o cerrada.
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Mensaje 'data-only' recibido en segundo plano: ", payload);

  // Extraemos la información del payload "data" que configuramos en la Cloud Function
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    // Pasamos la URL a la notificación para que se abra al hacer clic
    data: {
        click_action: payload.data.click_action 
    }
  };

  // Mostramos la notificación usando los datos recibidos
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Este manejador se activa cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
    // Cierra la notificación
    event.notification.close(); 
    
    const urlToOpen = event.notification.data.click_action;
    if (urlToOpen) {
        // Busca si ya hay una ventana de la app abierta y la enfoca. Si no, abre una nueva.
        event.waitUntil(clients.matchAll({
            type: "window"
        }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }));
    }
});







