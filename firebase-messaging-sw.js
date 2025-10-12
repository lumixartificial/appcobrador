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

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// [CÓDIGO REFORZADO] - Manejador para notificaciones en segundo plano.
messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Mensaje recibido en segundo plano: ", payload);

    // Hace el código más robusto al aceptar datos de 'data' o 'notification'
    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';
    
    // [CAMBIO CLAVE #1] - Construimos la URL de destino completa y absoluta aquí mismo.
    // Esto elimina cualquier ambigüedad en el manejador de clics.
    const targetUrl = new URL('#notifications', self.registration.scope).href;

    const notificationOptions = {
        body: notificationBody,
        icon: payload.data?.icon || '/favicon.ico',
        badge: '/badge-icon.png', // Ícono para la barra de Android
        data: {
            url: targetUrl // Guardamos la URL completa y lista para usar.
        }
    };

    console.log('[SW] Mostrando notificación con título:', notificationTitle, 'y datos:', notificationOptions.data);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [CÓDIGO FINAL Y DEFINITIVO] - Manejador de clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificación clickeada.');
    event.notification.close();

    // [CAMBIO CLAVE #2] - Obtenemos la URL de destino, ya pre-construida, directamente de los datos.
    let targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error('[SW] URL de destino não encontrada. Abrindo a página inicial como fallback.');
        // Como fallback de seguridad, abre la página de inicio.
        targetUrl = self.registration.scope;
    }

    console.log(`[SW] Intentando abrir o enfocar: ${targetUrl}`);

    // Este es el patrón correcto: buscar una ventana existente antes de abrir una nueva.
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // 1. Busca una ventana de la app que ya esté abierta.
            for (const client of clientList) {
                // Comparamos el origen (dominio) para asegurarnos de que es nuestra app.
                if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                    console.log('[SW] App encontrada. Navegando para a seção de notificações e focando.');
                    // Si la encontramos, la dirigimos a la URL correcta y la traemos al frente.
                    return client.navigate(targetUrl).then(c => c.focus());
                }
            }
            
            // 2. Si el bucle termina y no se encontró ninguna ventana, la app está cerrada.
            if (clients.openWindow) {
                console.log('[SW] App não encontrada. Abrindo uma nova janela.');
                // Abrimos la URL de destino que ya preparamos.
                return clients.openWindow(targetUrl);
            }
        }).catch(err => {
            console.error('[SW] Erro no manejador de notificationclick:', err);
        })
    );
});
