// Preload: establece un usuario demo en localStorage para que la app funcione sin Google
(function(){
  const demoUser = { name: 'Demo User', email: 'demo@local', provider: 'local' };
  try{
    // Esperar DOMContentLoaded para asegurar localStorage disponible
    window.addEventListener('DOMContentLoaded', ()=>{
      try{ localStorage.setItem('glance_user_v1', JSON.stringify(demoUser)); }catch(e){}
    });
  }catch(e){}
})();
