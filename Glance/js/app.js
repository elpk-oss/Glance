// Glance - Red Social Demo v2
// Características: Autenticación Google, Publicaciones con likes/vistas, Perfiles con suscriptores

// --- Configuración de Firebase ---
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_AUTH_DOMAIN",
  projectId: "REPLACE_PROJECT_ID",
  appId: "REPLACE_APP_ID"
};

// --- Google Identity Services ---
const googleClientId = "330982716509-rrk5r5qr3d6llr8sa97fngka34rh0cb3.apps.googleusercontent.com";

// --- LocalStorage Keys ---
const POSTS_KEY = 'glance_posts_v2';
const USER_KEY = 'glance_user_v2';
const PROFILES_KEY = 'glance_profiles_v2';
const FOLLOWERS_KEY = 'glance_followers_v2';
const LIKES_KEY = 'glance_likes_v2';
const VIEWS_KEY = 'glance_views_v2';

// Inicializar Firebase
function initFirebase(){
  try{
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado');
  }catch(e){
    console.warn('Firebase no configurado');
  }
}

// Inicializar Google Identity Services
function initGoogleIdentity(){
  if(!window.google || !google.accounts || !google.accounts.id) return;
  try{
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      ux_mode: 'popup'
    });
    google.accounts.id.renderButton(
      document.getElementById('gsi-button'),
      { theme: 'outline', size: 'large', width: 200 }
    );
    console.log('GSI inicializado');
  }catch(e){
    console.warn('No fue posible inicializar GSI', e);
  }
}

function handleCredentialResponse(response){
  try{
    const payload = parseJwt(response.credential);
    const name = payload.name || 'Usuario';
    const email = payload.email || '';
    const user = { name, email, provider: 'gsi', uid: email };
    saveUserToStorage(user);
    initializeUserProfile(user);
    updateUIAfterLogin();
    console.log('GSI signed in', payload);
  }catch(err){
    console.error('Error parsing GSI credential', err);
  }
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// --- Gestión de Usuarios y Perfiles ---
function saveUserToStorage(user){
  try{ localStorage.setItem(USER_KEY, JSON.stringify(user)); }catch(e){}
}

function loadUserFromStorage(){
  try{
    const raw = localStorage.getItem(USER_KEY);
    return raw? JSON.parse(raw) : null;
  }catch(e){return null}
}

function getCurrentUser(){
  return loadUserFromStorage();
}

// Inicializar perfil de usuario
function initializeUserProfile(user){
  const profiles = loadProfiles();
  if(!profiles[user.uid]){
    profiles[user.uid] = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      bio: 'Bio pendiente',
      followers: 0,
      following: 0,
      posts: 0,
      createdAt: Date.now()
    };
    saveProfiles(profiles);
  }
}

function loadProfiles(){
  try{
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}

function saveProfiles(profiles){
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getProfile(uid){
  const profiles = loadProfiles();
  return profiles[uid] || null;
}

function updateProfile(uid, updates){
  const profiles = loadProfiles();
  if(profiles[uid]){
    profiles[uid] = {...profiles[uid], ...updates};
    saveProfiles(profiles);
  }
}

// --- Gestión de Seguidores ---
function getFollowers(uid){
  try{
    const raw = localStorage.getItem(FOLLOWERS_KEY);
    const followers = raw? JSON.parse(raw) : {};
    return followers[uid] || [];
  }catch(e){ return []; }
}

function addFollower(targetUid, followerUid){
  try{
    const raw = localStorage.getItem(FOLLOWERS_KEY);
    const followers = raw? JSON.parse(raw) : {};
    if(!followers[targetUid]) followers[targetUid] = [];
    if(!followers[targetUid].includes(followerUid)){
      followers[targetUid].push(followerUid);
      localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(followers));
      
      // Actualizar counters
      const profiles = loadProfiles();
      if(profiles[targetUid]) profiles[targetUid].followers = followers[targetUid].length;
      if(!profiles[followerUid]) profiles[followerUid] = {uid: followerUid, followers: 0, following: 0, posts: 0};
      if(!profiles[followerUid].following) profiles[followerUid].following = 0;
      profiles[followerUid].following++;
      saveProfiles(profiles);
    }
  }catch(e){}
}

function removeFollower(targetUid, followerUid){
  try{
    const raw = localStorage.getItem(FOLLOWERS_KEY);
    const followers = raw? JSON.parse(raw) : {};
    if(followers[targetUid]){
      followers[targetUid] = followers[targetUid].filter(u => u !== followerUid);
      localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(followers));
      
      const profiles = loadProfiles();
      if(profiles[targetUid]) profiles[targetUid].followers = followers[targetUid].length;
      if(profiles[followerUid]) profiles[followerUid].following--;
      saveProfiles(profiles);
    }
  }catch(e){}
}

function isFollowing(targetUid, followerUid){
  return getFollowers(targetUid).includes(followerUid);
}

// --- Gestión de Likes ---
function getLikes(postId){
  try{
    const raw = localStorage.getItem(LIKES_KEY);
    const likes = raw? JSON.parse(raw) : {};
    return likes[postId] || [];
  }catch(e){ return []; }
}

function addLike(postId, uid){
  try{
    const raw = localStorage.getItem(LIKES_KEY);
    const likes = raw? JSON.parse(raw) : {};
    if(!likes[postId]) likes[postId] = [];
    if(!likes[postId].includes(uid)){
      likes[postId].push(uid);
      localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    }
  }catch(e){}
}

function removeLike(postId, uid){
  try{
    const raw = localStorage.getItem(LIKES_KEY);
    const likes = raw? JSON.parse(raw) : {};
    if(likes[postId]){
      likes[postId] = likes[postId].filter(u => u !== uid);
      localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    }
  }catch(e){}
}

function hasLiked(postId, uid){
  return getLikes(postId).includes(uid);
}

// --- Gestión de Vistas ---
function getViews(postId){
  try{
    const raw = localStorage.getItem(VIEWS_KEY);
    const views = raw? JSON.parse(raw) : {};
    return views[postId] || 0;
  }catch(e){ return 0; }
}

function addView(postId, uid){
  try{
    const raw = localStorage.getItem(VIEWS_KEY);
    const views = raw? JSON.parse(raw) : {};
    if(!views[postId]) views[postId] = [];
    if(!views[postId].includes(uid)){
      views[postId].push(uid);
      localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
    }
  }catch(e){}
}

// --- Gestión de Posts ---
function loadPosts(){
  try{
    const raw = localStorage.getItem(POSTS_KEY);
    return raw? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function savePosts(posts){
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function addPost(text){
  const user = getCurrentUser();
  if(!user) return;
  
  const posts = loadPosts();
  const postId = 'post_' + Date.now();
  posts.unshift({
    id: postId,
    text: text,
    uid: user.uid,
    userName: user.name,
    createdAt: Date.now()
  });
  savePosts(posts);
  
  // Actualizar contador de posts del usuario
  const profile = getProfile(user.uid);
  if(profile){
    profile.posts = posts.filter(p => p.uid === user.uid).length;
    updateProfile(user.uid, profile);
  }
  
  renderPosts();
}

function deletePost(postId){
  let posts = loadPosts();
  const post = posts.find(p => p.id === postId);
  if(!post) return;
  
  posts = posts.filter(p => p.id !== postId);
  savePosts(posts);
  
  // Limpiar likes y vistas
  const likes = localStorage.getItem(LIKES_KEY);
  const views = localStorage.getItem(VIEWS_KEY);
  if(likes){
    const likesObj = JSON.parse(likes);
    delete likesObj[postId];
    localStorage.setItem(LIKES_KEY, JSON.stringify(likesObj));
  }
  if(views){
    const viewsObj = JSON.parse(views);
    delete viewsObj[postId];
    localStorage.setItem(VIEWS_KEY, JSON.stringify(viewsObj));
  }
  
  renderPosts();
}

// --- Renderizado de Posts ---
function renderPosts(){
  const feed = document.getElementById('feed');
  if(!feed) return;
  
  Array.from(feed.querySelectorAll('.post')).forEach(node=>{
    if(node.id !== 'new-post-form') node.remove();
  });
  
  const posts = loadPosts();
  const currentUser = getCurrentUser();
  
  posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'post';
    postEl.setAttribute('data-post-id', post.id);
    
    const likes = getLikes(post.id);
    const views = getViews(post.id);
    const currentUserLiked = currentUser && hasLiked(post.id, currentUser.uid);
    const likesCount = likes.length;
    
    // Registrar vista
    if(currentUser){
      addView(post.id, currentUser.uid);
    }
    
    const isOwnPost = currentUser && currentUser.uid === post.uid;
    const deleteBtn = isOwnPost ? `<button class="btn-delete" data-post-id="${post.id}">Eliminar</button>` : '';
    
    postEl.innerHTML = `
      <div class="post-header">
        <div class="post-author">
          <strong class="author-link" data-uid="${post.uid}">${escapeHtml(post.userName)}</strong>
          <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
        </div>
        ${deleteBtn}
      </div>
      <div class="post-content">${escapeHtml(post.text)}</div>
      <div class="post-stats">
        <span class="stat"><i>👁️</i> ${views} vistas</span>
        <span class="stat"><i>❤️</i> ${likesCount} likes</span>
      </div>
      <div class="post-actions">
        <button class="btn-like ${currentUserLiked ? 'active' : ''}" data-post-id="${post.id}">
          ${currentUserLiked ? '❤️' : '🤍'} Me gusta
        </button>
        <button class="btn-reply" data-post-id="${post.id}">💬 Responder</button>
        <button class="btn-share" data-post-id="${post.id}">📤 Compartir</button>
      </div>
    `;
    
    feed.appendChild(postEl);
    
    // Event listeners
    const likeBtn = postEl.querySelector('.btn-like');
    if(likeBtn && currentUser){
      likeBtn.addEventListener('click', ()=>{
        if(hasLiked(post.id, currentUser.uid)){
          removeLike(post.id, currentUser.uid);
        } else {
          addLike(post.id, currentUser.uid);
        }
        renderPosts();
      });
    } else if(likeBtn){
      likeBtn.addEventListener('click', ()=> alert('Inicia sesión para dar like'));
    }
    
    const deleteBtn2 = postEl.querySelector('.btn-delete');
    if(deleteBtn2){
      deleteBtn2.addEventListener('click', ()=> deletePost(post.id));
    }
    
    const authorLink = postEl.querySelector('.author-link');
    if(authorLink){
      authorLink.addEventListener('click', ()=> showProfile(post.uid));
    }
  });
}

// --- Perfil de Usuario ---
function showProfile(uid){
  const profile = getProfile(uid);
  if(!profile) return;
  
  const currentUser = getCurrentUser();
  const followers = getFollowers(uid);
  const isFollowing = currentUser && followers.includes(currentUser.uid);
  
  // Mostrar modal de perfil
  const modal = document.createElement('div');
  modal.className = 'profile-modal';
  modal.innerHTML = `
    <div class="profile-modal-content">
      <button class="modal-close">&times;</button>
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <h2>${escapeHtml(profile.name)}</h2>
          <p class="profile-email">${escapeHtml(profile.email)}</p>
          <p class="profile-bio">${escapeHtml(profile.bio)}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <strong>${profile.posts || 0}</strong>
              <span>Publicaciones</span>
            </div>
            <div class="stat-item">
              <strong>${followers.length}</strong>
              <span>Seguidores</span>
            </div>
            <div class="stat-item">
              <strong>${profile.following || 0}</strong>
              <span>Siguiendo</span>
            </div>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        ${currentUser && currentUser.uid !== uid ? `
          <button class="btn ${isFollowing ? 'following' : ''}" data-uid="${uid}">
            ${isFollowing ? '✓ Siguiendo' : '+ Seguir'}
          </button>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-close').addEventListener('click', ()=> modal.remove());
  modal.addEventListener('click', (e)=> {
    if(e.target === modal) modal.remove();
  });
  
  const followBtn = modal.querySelector('[data-uid]');
  if(followBtn){
    followBtn.addEventListener('click', ()=> {
      if(isFollowing){
        removeFollower(uid, currentUser.uid);
      } else {
        addFollower(uid, currentUser.uid);
      }
      modal.remove();
      showProfile(uid);
    });
  }
}

// --- UI Updates ---
function updateUIAfterLogin(){
  const user = getCurrentUser();
  const profile = getProfile(user.uid);
  
  document.querySelector('.profile-card .name').textContent = user.name;
  document.querySelector('.profile-card .email').textContent = user.email;
  document.querySelector('.profile-card .avatar').textContent = user.name.charAt(0).toUpperCase();
  
  // Mostrar stats en sidebar
  if(!document.querySelector('.profile-stats-sidebar')){
    const statsDiv = document.createElement('div');
    statsDiv.className = 'profile-stats-sidebar';
    statsDiv.innerHTML = `
      <div class="stat-item">
        <strong>0</strong>
        <span>Publicaciones</span>
      </div>
      <div class="stat-item">
        <strong>0</strong>
        <span>Seguidores</span>
      </div>
    `;
    document.querySelector('.profile-card').appendChild(statsDiv);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>\"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

// --- Eventos iniciales ---
document.addEventListener('DOMContentLoaded', ()=>{
  initFirebase();
  initGoogleIdentity();
  
  const user = loadUserFromStorage();
  if(user){
    initializeUserProfile(user);
    updateUIAfterLogin();
  }
  
  renderPosts();
  
  const form = document.getElementById('new-post-form');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const user = getCurrentUser();
      if(!user){
        alert('Debes iniciar sesión para publicar');
        return;
      }
      const textEl = document.getElementById('new-post-text');
      if(!textEl) return;
      const text = textEl.value.trim();
      if(!text) return;
      addPost(text);
      textEl.value = '';
    });
  }
  
  const btnLogin = document.getElementById('btn-login');
  if(btnLogin){
    btnLogin.addEventListener('click', handleGoogleSignIn);
  }
});

function handleGoogleSignIn(){
  if(!window.firebase || !firebase.auth){
    alert('Autenticación no disponible. Sigue las instrucciones en firebase_instructions.md');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result=>{
      const user = result.user;
      const userData = {
        name: user.displayName || 'Usuario',
        email: user.email || '',
        provider: 'firebase',
        uid: user.uid
      };
      saveUserToStorage(userData);
      initializeUserProfile(userData);
      updateUIAfterLogin();
      renderPosts();
    })
    .catch(err=>{
      console.error('Error sign-in', err);
      alert('Error al iniciar sesión: '+err.message);
    });
}
