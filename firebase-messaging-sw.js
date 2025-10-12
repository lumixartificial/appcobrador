// firebase-messaging-sw.js
// Version: 1.7 (Incrementa este número para forzar actualizaciones)
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

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// --- INICIO DE LA LÓGICA ANTI-DUPLICADOS ---
// Esta variable guardará las "firmas" de las notificaciones recientes.
let recentNotifications = [];
// --- FIN DE LA LÓGICA ANTI-DUPLICADOS ---

// Este manejador se activa cuando llega una notificación con la app en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ", payload);

    // Extraemos la información del payload "data", como ya lo hacías.
    const notificationTitle = payload.data.title;
    const notificationBody = payload.data.body;

    // --- LÓGICA DEL "PORTERO" ---
    // 1. Creamos una firma única para esta notificación.
    const signature = `${notificationTitle}|${notificationBody}`;

    // 2. Verificamos si ya hemos mostrado una notificación con esta firma recientemente.
    if (recentNotifications.includes(signature)) {
        console.log("Notificación duplicada detectada y bloqueada:", signature);
        // Si es un duplicado, detenemos la ejecución aquí y no la mostramos.
        return; 
    }

    // 3. Si no es un duplicado, la guardamos en nuestra lista de recientes.
    recentNotifications.push(signature);

    // 4. Programamos la eliminación de la firma después de 5 segundos.
    setTimeout(() => {
        recentNotifications = recentNotifications.filter(s => s !== signature);
    }, 5000); // 5 segundos
    // --- FIN DE LA LÓGICA DEL "PORTERO" ---

    const notificationOptions = {
        body: notificationBody,
        icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png', // Ícono por defecto
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png', // Ícono para la barra de notificaciones
        data: {
            click_action: payload.data.click_action
        }
    };

    // Mostramos la notificación (solo si no fue bloqueada)
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Este manejador se activa cuando el usuario hace clic en la notificación (tu código original)
self.addEventListener('notificationclick', (event) => {
    // Cierra la notificación
    event.notification.close();

    const urlToOpen = event.notification.data.click_action;
    if (urlToOpen) {
        // Abre la ventana de la app en la URL especificada
        event.waitUntil(clients.openWindow(urlToOpen));
    }
});
