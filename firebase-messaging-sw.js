const SW_VERSION = "v5.1-loop-fix"; // Versión actualizada para forzar la actualización

// Importa los scripts de Firebase. Esto debe hacerse primero.
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    // [CORRECCIÓN CRÍTICA] Se ha corregido el appId. Ahora es idéntico al de la aplicación principal.
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);

// Obtén la instancia de Messaging DESPUÉS de inicializar Firebase.
const messaging = firebase.messaging();

console.log(`[SW-COBRADOR] Service Worker ${SW_VERSION} cargado y listo.`);

/**
 * [LÓGICA CLAVE PARA MOSTRAR NOTIFICACIONES]
 * Esto se ejecuta cuando llega un mensaje y la app está cerrada o en segundo plano.
 */
messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-COBRADOR-DIAGNOSTICO ${SW_VERSION}]`;
  console.log(`${LOG_PREFIX} >>> ¡MENSAJE EN SEGUNDO PLANO RECIBIDO! <<<`, payload);

  try {
    if (!payload.data) {
      console.error(`${LOG_PREFIX} ERROR FATAL: El payload no contiene la sección 'data'. No se puede mostrar la notificación.`);
      return;
    }
    console.log(`${LOG_PREFIX} Payload 'data' validado.`, payload.data);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon,
      tag: 'lumix-cobrador-notification', 
      data: {
        url: payload.data.url 
      }
    };
    console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

    console.log(`${LOG_PREFIX} Intentando mostrar la notificación AHORA...`);
    // self.registration.showNotification devuelve una "Promise", la retornamos para que el SW sepa que debe esperar.
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log(`${LOG_PREFIX} ¡ÉXITO! showNotification() se completó.`);
      })
      .catch(err => {
        console.error(`${LOG_PREFIX} ERROR DENTRO de showNotification():`, err);
      });

  } catch (error) {
    console.error(`${LOG_PREFIX} ERROR CATASTRÓFICO DENTRO DE onBackgroundMessage:`, error);
  }
});

// [CORRECCIÓN DEL BUCLE INFINITO]
// Se han eliminado los listeners 'install' y 'activate' que contenían self.skipWaiting() y self.clients.claim().
// Esto puede causar un bucle de recarga si la página principal tiene un script que fuerza la recarga cuando se activa un nuevo SW.
// Al eliminarlos, el SW se actualizará de forma segura en segundo plano, y se activará cuando el usuario cierre todas las pestañas de la app.
// Este es el comportamiento estándar y más seguro.


/**
 * [LÓGICA PARA EL CLIC]
 * Esto se ejecuta cuando el usuario toca la notificación.
 */

/**
 * [LÓGICA PARA EL CLIC - SIMPLIFICADA]
 * Intenta abrir la ventana directamente. Menos elegante pero más robusto.
 */
self.addEventListener('notificationclick', (event) => {
    const LOG_PREFIX = `[SW ${SW_VERSION}]`;
    console.log(`${LOG_PREFIX} El usuario hizo clic en la notificación.`);
    event.notification.close();

    const targetUrl = event.notification.data.url || self.location.origin;
    console.log(`${LOG_PREFIX} URL de destino: ${targetUrl}`);

    // Intenta abrir la ventana. Si falla, el navegador lo manejará.
    const promiseChain = clients.openWindow(targetUrl)
        .catch(err => {
            console.error(`${LOG_PREFIX} Error al intentar abrir ventana con clients.openWindow:`, err);
            // No hay mucho más que hacer aquí si openWindow falla.
        });

    event.waitUntil(promiseChain);
});

