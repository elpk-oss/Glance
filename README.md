# Glance — Demo local

Proyecto demo de una red social llamada **Glance**. Interfaz responsive (PC/Móvil/Tablet/TV) con inicio de sesión Google (Google Identity Services integrado) y publicaciones simples guardadas en `localStorage` (sin backend).

Archivos clave:
- [index.html](index.html) — Interfaz principal.
- [css/styles.css](css/styles.css) — Estilos responsive.
- [js/app.js](js/app.js) — Lógica: GSI (Google Identity), Firebase opcional, posts en `localStorage`.
- [firebase_instructions.md](firebase_instructions.md) — Si prefieres usar Firebase Authentication / Firestore.

Cómo abrir y usar localmente:

1) Desde el explorador: puedes abrir `index.html` con doble clic (sitio estático). Algunas funciones de Google Identity requieren correr en `http(s)`; si el botón GSI no aparece, usa un servidor local.

2) Servidor local rápido (recomendado): desde la carpeta del proyecto ejecuta uno de estos comandos:

```bash
# con Node (http-server)
npx http-server .

# o con Python 3
python -m http.server 5500
```

Luego abre `http://localhost:8080` (o `http://localhost:5500`) en tu navegador.

Uso:
- Publicar: escribe en el campo "¿Qué estás pensando?" y pulsa `Publicar`. Las publicaciones se guardan en tu navegador (localStorage).
- Iniciar sesión: usa el botón "Iniciar con Google (Firebase)" para flujo Firebase (si lo configuras), o el botón de Google que aparece al lado (GSI) usando el Client ID integrado.

Despliegue gratuito:
- GitHub Pages: perfecto para sitios estáticos (solo sube los archivos y activa Pages en el repositorio).
- Vercel o Netlify: despliegue automático desde Git.

Si quieres que configure Firebase (Auth + Firestore) para persistir posts en la nube, pégame el objeto `firebaseConfig` y habilito Firestore con reglas de lectura/escritura para desarrollo.

Desktop (Electron) — ejecución local sin HTTPS
-------------------------------------------

Si prefieres una aplicación de escritorio para ver `Glance` sin lidiar con HTTPS local, sigue estos pasos (Windows):

1. Instala Node.js (versión 16+): https://nodejs.org/

2. Abre PowerShell en la carpeta del proyecto (por ejemplo la carpeta extraída `Glance`):

```powershell
cd "%USERPROFILE%\Downloads\Glance"
npm install
npm run start
```

3. Se abrirá una ventana de escritorio con la app. No necesita HTTPS; un usuario demo (`Demo User`) se inyecta automáticamente para que veas el feed y publiques localmente.

Notas:
- El comando `npm install` descargará `electron` y creará `node_modules` (necesitas conexión a Internet al menos una vez).
- Si quieres un ejecutable independiente (.exe) puedo guiarte para crear uno usando `electron-packager` o `electron-builder`.
