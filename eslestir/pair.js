'use strict';
// The hostname contains no server IP. Configure Cloudflare proxied DNS and
// certificate for this branded domain BEFORE enabling production pairing.
const API = 'https://subs-api.pintipin.com';
const form = document.getElementById('pair-form');
const input = document.getElementById('pair-code');
const status = document.getElementById('pair-status');
const submit = document.getElementById('pair-submit');
const setStatus = (text, kind='') => { status.textContent=text;status.className=kind; };
function bytesFromBase64Url(value) {
 const padded=value.replace(/-/g,'+').replace(/_/g,'/');
 return Uint8Array.from(atob(padded.padEnd(Math.ceil(padded.length/4)*4,'=')), x=>x.charCodeAt(0));
}
let vapidKey = '';
// Check availability on page load so iOS permission is requested *inside* a user click.
(async()=>{
 try {
   const response=await fetch(API+'/v1/push/public-key',{cache:'no-store',signal:AbortSignal.timeout(7000)});
   if (!response.ok) throw new Error('Sunucu hazır değil ('+response.status+').');
   const data=await response.json();
   if (typeof data.public_key!=='string' || !data.public_key) throw new Error('Bildirim anahtarı bulunamadı.');
   vapidKey=data.public_key;
 } catch(_error) {
   submit.disabled=true;
   setStatus('Eşleştirme sunucusu henüz yapılandırılıyor. Bu sayfa hazır; güvenli bağlantı etkinleştiğinde kod kullanılabilir.','error');
 }
})();
form.addEventListener('submit', async event=>{
 event.preventDefault();
 const code=input.value.replace(/\D/g,'');
 if(!/^\d{8}$/.test(code)){setStatus('Bilgisayarındaki sekiz haneli kodu gir.','error');return;}
 if(!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
   setStatus('Bu tarayıcı push bildirimlerini desteklemiyor. iPhone’da siteyi Safari ile ana ekrana ekleyip oradan aç.','error');return;
 }
 if(!vapidKey){setStatus('Eşleştirme hizmeti şu an hazır değil.','error');return;}
 // Trigger permission synchronously as part of a direct user gesture (iOS requirement).
 const permissionPromise=Notification.requestPermission();
 submit.disabled=true;
 setStatus('Güvenli eşleştirme yapılıyor…');
 try{
   const allowed=await permissionPromise;
   if(allowed!=='granted')throw new Error('Bildirim izni verilmedi. Tarayıcı ayarlarını kontrol et.');
   const reg=await navigator.serviceWorker.register('../sw.js',{scope:'../'});
   const previous=await reg.pushManager.getSubscription();
   const sub=previous||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytesFromBase64Url(vapidKey)});
   const claim=await fetch(API+'/v1/pair/claim',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...sub.toJSON(),code,consent:true}),cache:'no-store',signal:AbortSignal.timeout(9000)});
   if(!claim.ok){if(claim.status===404)throw new Error('Kod geçersiz, süresi dolmuş veya kullanılmış. Yeni kod oluştur.');
      if(claim.status===429)throw new Error('Çok fazla deneme yapıldı. Biraz sonra tekrar dene.');
      throw new Error('Eşleştirme gerçekleştirilemedi ('+claim.status+').');}
   setStatus('✓ Eşleştirildi! PintiSubs sürüm duyuruları telefona gelebilir. Oyun konuşmaları aktarılmıyor.','ok');
   input.value='';
 }catch(err){
   const msg=err instanceof TypeError?'Güvenli bağlantı henüz hazır değil. Eşleştirme servisi devreye alındıktan sonra tekrar dene.':err?.message;
   setStatus(msg||'Bağlantı kurulamadı.','error');
 }finally{submit.disabled=false;}
});