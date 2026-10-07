const CACHE_NAME = 'calma-v3';

// Recursos iniciales que deben guardarse para funcionar offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/@phosphor-icons/web'
];

// Instalación: Guardar todo lo esencial en el caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, guardando recursos...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Forzar a que este SW sea el activo
  );
});

// Activación: Limpiar cachés viejos si actualizamos la app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones (modo offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si está en caché, devolverlo (incluso sin internet)
        if (cachedResponse) {
            return cachedResponse;
        }

        // Si no está, ir a internet a buscarlo y guardarlo dinámicamente
        return fetch(event.request).then(response => {
           // Guardar fuentes, iconos y otros archivos externos para la próxima vez
           if (!response || response.status !== 200 || response.type !== 'basic' && !event.request.url.startsWith('https://fonts') && !event.request.url.startsWith('https://unpkg')) {
               return response;
           }
           
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache);
           });
           
           return response;
        });
      })
      .catch(() => {
        // Fallback si no hay internet y no está en caché (ej. una nueva página)
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
      })
  );
});
