self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (!event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
    return;
  }

  console.log('Action ID:', event.action);
  console.log('Reply text:', event.reply);
});
