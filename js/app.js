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
  ensureDemoPosts();
  renderStories();
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
    const avatar = `<div class="avatar-sm">${(p.userName||'').charAt(0).toUpperCase()}</div>`;
    const userHtml = `<div class="meta"><div class="avatar-sm">${escapeHtml((p.userName||'').charAt(0).toUpperCase())}</div><div><strong>${escapeHtml(p.userName||'Anónimo')}</strong><div style="color:var(--muted);font-size:0.85rem">${new Date(p.createdAt).toLocaleDateString()}</div></div></div>`;
    const imageHtml = p.image? `<img class="post-image" src="${escapeHtml(p.image)}" alt="post image">` : '';
    d.innerHTML = `${userHtml}<div style="margin-top:10px">${escapeHtml(p.text)}</div>${imageHtml}<div class="actions">❤  ${p.likes||0} &nbsp;&nbsp; 💬 ${p.comments||0}</div>`;
    feed.appendChild(d);
  });
}

function renderStories(){
  const s = document.getElementById('stories');
  if(!s) return;
  const stories = [
    {name:'Amigos', img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'},
    {name:'Trending', img:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=400&fit=crop'},
    {name:'Videos', img:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=400&h=400&fit=crop'},
    {name:'Música', img:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
  ];
  s.innerHTML = '';
  stories.forEach(st=>{
    const el = document.createElement('div'); el.className = 'story';
    el.innerHTML = `<div class="ring"><img src="${st.img}" alt="${escapeHtml(st.name)}"></div><div class="label">${escapeHtml(st.name)}</div>`;
    s.appendChild(el);
  });
}

function ensureDemoPosts(){
  const posts = loadPosts();
  if(posts && posts.length>0) return;
  const sample = [
    {text:'Bienvenido a Glance — prueba publicar, dar like y explorar.', createdAt: Date.now()-1000*60*60, userName:'Glance Team', image:'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&h=800&fit=crop', likes:12, comments:3},
    {text:'Mira este atardecer increíble!', createdAt: Date.now()-1000*60*60*5, userName:'Alicia', image:'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=1200&h=800&fit=crop', likes:34, comments:6},
    {text:'Vídeos cortos y tendencias cada día.', createdAt: Date.now()-1000*60*60*24, userName:'Juan', likes:5, comments:1}
  ];
  savePosts(sample);
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
