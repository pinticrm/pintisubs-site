'use strict';
// 0.1: old push/notification worker removed. Unregister any prior install.
self.addEventListener('install',event=>self.skipWaiting());
self.addEventListener('activate',event=>{
 event.waitUntil(self.registration.unregister());
});
