# Instrucciones: configurar Google Sign-In con Firebase (gratis)

1) Crear proyecto en Firebase
  - Ve a https://console.firebase.google.com/ y inicia sesión con tu cuenta Google.
  - Crea un proyecto nuevo (nombre: NuevaRedSocial-demo).

2) Registrar aplicación web
  - En el proyecto, añade una App web (ícono </>). Anota la configuración que te dé (apiKey, authDomain, projectId, appId).

3) Habilitar proveedor Google
  - En el panel de Firebase: Authentication → Sign-in method → habilita Google.

4) Configurar dominio autorizado (si usas localhost)
  - En Authentication → Settings agrega `http://localhost` y `http://localhost:5500` (u otro puerto) como dominios autorizados.

5) Reemplazar config en `js/app.js`
  - Copia los valores que te dio Firebase en el objeto `firebaseConfig` dentro de `js/app.js`.

6) Probar localmente
  - Abre `index.html` en el navegador (o usa un servidor local simple: `npx http-server .` o la extensión Live Server de VS Code).
  - Haz clic en "Iniciar con Google" y completa el flujo.

Alternativa sin Firebase (solo Google OAuth):
  - Requiere crear un proyecto en Google Cloud Console y configurar OAuth 2.0 Client ID.
  - Tendrás que manejar redirecciones y verificar URLs; para un principiante Firebase es más fácil y gratuito.

Notas sobre coste: Firebase tiene un plan gratuito (Spark) suficiente para desarrollo y pequeña audiencia. No es necesario pagar para empezar.
