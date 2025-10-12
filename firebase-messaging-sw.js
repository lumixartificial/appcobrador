// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

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

// Este manejador se activa cuando llega una notificación con la app en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ", payload);

    // Extraemos la información del payload "data"
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png', // Un ícono por si acaso
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png', // Ícono para la barra de notificaciones de Android
        
        // [CAMBIO CLAVE] - Guardamos el "hash" de destino en lugar de una URL completa.
        // Esto hace que el manejador de clics sea más robusto y flexible.
        data: {
            hash: '#notifications' 
        }
    };

    // Mostramos la notificación
    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// [CÓDIGO ACTUALIZADO] - Este manejador se activa cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificación clickeada:', event.notification.data);
    
    // Cierra la notificación
    event.notification.close();

    // Construimos la URL de destino completa y segura.
    // self.registration.scope es la URL base de tu PWA (ej: "https://cobrador.lumixartificial.com/")
    // Le añadimos el hash para ir a la sección correcta.
    const targetHash = event.notification.data.hash || '#';
    const targetUrl = new URL(targetHash, self.registration.scope).href;

    console.log(`[SW] URL de destino construida: ${targetUrl}`);

    // event.waitUntil() asegura que el navegador no termine el service worker
    // antes de que nuestra operación asíncrona se complete.
    event.waitUntil(
        (async () => {
            // Buscamos si ya hay una ventana o pestaña de nuestra app abierta.
            const clientList = await clients.matchAll({
                type: "window",
                includeUncontrolled: true 
            });

            // 1. Si encontramos una ventana abierta, la enfocamos y la dirigimos a la sección correcta.
            for (const client of clientList) {
                // Comparamos el `scope` para asegurarnos de que es nuestra PWA
                if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
                    console.log('[SW] App encontrada. Navegando y enfocando.');
                    await client.navigate(targetUrl);
                    return client.focus();
                }
            }

            // 2. Si el bucle termina, significa que la app está cerrada. La abrimos.
            if (clients.openWindow) {
                console.log('[SW] App no encontrada. Abriendo una nueva ventana.');
                return clients.openWindow(targetUrl);
            }
        })()
    );
});
