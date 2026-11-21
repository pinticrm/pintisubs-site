'use strict';
self.addEventListener('push',event=>{
 let info={title:'PintiSubs',body:'PintiSubs sürüm duyurusu'};
 try{ if(event.data)info={...info,...event.data.json()}; }catch(_error){}
 // Only server-side owner-initiated product notifications; never game/OCR text.
 const title=String(info.title||'PintiSubs').slice(0,90);
 const body=String(info.body||'Yeni duyuru').slice(0,240);
 event.waitUntil(self.registration.showNotification(title,{body,icon:'assets/mark.svg',badge:'assets/mark.svg',tag:'pintisubs-release'}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(clients.openWindow('https://pinticrm.github.io/pintisubs-site/'));
});