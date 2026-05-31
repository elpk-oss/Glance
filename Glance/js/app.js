// Código JavaScript de ejemplo: UI mínimo y autenticación Firebase (Google)

// --- Configuración de Firebase ---
// Sustituye estos valores con tu configuración de Firebase (ver firebase_instructions.md)
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_AUTH_DOMAIN",
  projectId: "REPLACE_PROJECT_ID",
  appId: "REPLACE_APP_ID"
};

// --- Google Identity Services (Client-only) ---
// Client ID que proporcionaste — usado si no quieres Firebase o como respaldo.
const googleClientId = "330982716509-rrk5r5qr3d6llr8sa97fngka34rh0cb3.apps.googleusercontent.com";

// Inicializar Firebase si está disponible
function initFirebase(){
  try{
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado');
  }catch(e){
    console.warn('Firebase no configurado (use firebase_instructions.md para configurar).');
  }
}

// Inicializar Google Identity Services (GSI) para inicio de sesión cliente
function initGoogleIdentity(){
  if(!window.google || !google.accounts || !google.accounts.id) return;
  try{
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup'
    });
    // Renderizar botón GSI en el contenedor
    google.accounts.id.renderButton(
      document.getElementById('gsi-button'),
      { theme: 'outline', size: 'large', width: 200 }
    );
    // Optionally request One Tap prompt
    // google.accounts.id.prompt();
    console.log('GSI inicializado');
  }catch(e){
    console.warn('No fue posible inicializar GSI', e);
  }
}

function handleCredentialResponse(response){
  // response.credential es un ID token JWT. Decodificamos el payload para obtener user info.
  try{
    const payload = parseJwt(response.credential);
    const name = payload.name || 'Usuario';
    const email = payload.email || '';
    const user = { name, email, provider: 'gsi' };
    saveUserToStorage(user);
    document.querySelector('.profile-card .name').textContent = name;
    document.querySelector('.profile-card .email').textContent = email;
    console.log('GSI signed in', payload);
  }catch(err){
    console.error('Error parsing GSI credential', err);
  }
}

function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initFirebase();
  initGoogleIdentity();
  const btnLogin = document.getElementById('btn-login');
  if(btnLogin) btnLogin.addEventListener('click', handleGoogleSignIn);
  // Posts localStorage: carga inicial y eventos
  loadUserFromStorage();
  renderPosts();
  const form = document.getElementById('new-post-form');
  if(form) form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const textEl = document.getElementById('new-post-text');
    if(!textEl) return;
    const text = textEl.value.trim();
    if(!text) return;
    addPost(text);
    textEl.value = '';
  });
});

// --- Posts simples guardados en localStorage (sin backend) ---
const POSTS_KEY = 'glance_posts_v1';
const USER_KEY = 'glance_user_v1';

function loadPosts(){
  try{
    const raw = localStorage.getItem(POSTS_KEY);
    return raw? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function savePosts(posts){
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function renderPosts(){
  const feed = document.getElementById('feed');
  if(!feed) return;
  // remove existing post elements except the form
  Array.from(feed.querySelectorAll('.post')).forEach(node=>{
    if(node.id!=='new-post-form') node.remove();
  });
  const posts = loadPosts();
  posts.forEach(p=>{
    const d = document.createElement('div');
    d.className = 'post';
    const user = p.userName? `<strong>${escapeHtml(p.userName)}</strong><br>` : '';
    d.innerHTML = `${user}<div>${escapeHtml(p.text)}</div><div style="color:var(--muted);font-size:0.9rem;margin-top:8px">${new Date(p.createdAt).toLocaleString()}</div>`;
    feed.appendChild(d);
  });
}

function addPost(text){
  const posts = loadPosts();
  const user = getCurrentUser() || {name:'Anónimo'};
  posts.unshift({text, createdAt: Date.now(), userName: user.name});
  savePosts(posts);
  renderPosts();
}

function escapeHtml(s){
  return String(s).replace(/[&<>\"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});
}

function saveUserToStorage(user){
  try{ localStorage.setItem(USER_KEY, JSON.stringify(user)); }catch(e){}
}

function loadUserFromStorage(){
  try{
    const raw = localStorage.getItem(USER_KEY);
    if(!raw) return;
    const u = JSON.parse(raw);
    if(u && u.name){
      document.querySelector('.profile-card .name').textContent = u.name;
      document.querySelector('.profile-card .email').textContent = u.email || '';
    }
  }catch(e){}
}

function getCurrentUser(){
  try{ const raw = localStorage.getItem(USER_KEY); return raw? JSON.parse(raw): null;}catch(e){return null}
}

function handleGoogleSignIn(){
  if(!window.firebase || !firebase.auth){
    alert('Autenticación no disponible. Sigue las instrucciones en firebase_instructions.md');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result=>{
      const user = result.user;
      document.querySelector('.profile-card .name').textContent = user.displayName || 'Usuario';
      document.querySelector('.profile-card .email').textContent = user.email || '';
      console.log('Signed in:', user);
    })
    .catch(err=>{
      console.error('Error sign-in', err);
      alert('Error al iniciar sesión: '+err.message);
    });
}
