self.addEventListener('fetch', () => {
  // Empty fetch event handler to bypass PWA installability criteria (https://web.dev/install-criteria/#criteria).
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (!event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
    return;
  }

  console.log('Action ID:', event.action);
  console.log('Reply text:', event.reply);
});
