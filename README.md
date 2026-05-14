# Calc Juti

Aplicación web con calculadora científica, conversor de divisas, conversor de unidades, gráficos, notas y autenticación con Google mediante Firebase.

## Stack

- Vite + React + TypeScript
- Firebase Authentication
- Firestore
- Zustand
- Tailwind CSS 4

## Desarrollo local

Requisitos: Node.js 20 o superior.

1. Instala dependencias con npm ci.
2. Inicia el entorno con npm run dev.
3. Abre <http://localhost:3000>.

## Acceso real con Firebase

El flujo de Acceder / Registrarse ya funciona en el frontend, pero Firebase solo permite el popup de Google desde dominios autorizados.

En Firebase Console configura esto:

1. Authentication > Sign-in method > Google > Enable.
2. Authentication > Settings > Authorized domains.
3. Firestore Database con reglas que permitan a usuarios autenticados leer y escribir lo que corresponda a sus notas.

En Authorized domains agrega:

- localhost
- tu usuario de GitHub Pages, por ejemplo tuusuario.github.io
- tu subdominio de Render, por ejemplo calc-juti.onrender.com
- tu dominio final si luego conectas uno propio

Si el dominio no está en esa lista, Firebase devolverá auth/unauthorized-domain.

## Despliegue en GitHub Pages

El proyecto ya queda preparado para publicarse como sitio estático en GitHub Pages.

1. Sube el repositorio a GitHub.
2. Deja la rama principal como main.
3. En Settings > Pages selecciona GitHub Actions como fuente.
4. Haz push a main y el workflow publicará la carpeta dist.

Notas:

- En GitHub Pages la app usa hash routing para evitar errores 404 al recargar rutas internas.
- La base pública se calcula con el nombre del repositorio durante el build del workflow.
- GitHub Pages sirve bien el frontend, pero no es un lugar seguro para guardar claves privadas.

## Despliegue en Render

También puedes desplegar el frontend como Static Site en Render.

1. Crea un Static Site desde el repositorio.
2. Render detectará el archivo render.yaml.
3. El build publica dist y reescribe las rutas hacia index.html.

Render es mejor opción cuando quieras añadir un backend propio, por ejemplo un proxy para OpenRouter o cualquier API con claves privadas.

## PWA y experiencia tipo app

La app ya queda preparada como PWA, así que puede instalarse sin Play Store.

- En Android o escritorio: abre el menú del navegador y elige Instalar aplicación o Agregar a pantalla principal.
- En iPhone o iPad: abre Safari, toca Compartir y luego Añadir a pantalla de inicio.

El build genera manifest.webmanifest, sw.js y los iconos necesarios para instalación.

## Router y base pública

El proyecto acepta estas variables de build:

- VITE_ROUTER_MODE: browser o hash
- VITE_BASE_PATH: ruta base pública, por ejemplo /calc-juti/

Valores recomendados:

- GitHub Pages: VITE_ROUTER_MODE=hash
- Render: VITE_ROUTER_MODE=browser

## OpenRouter

Ahora mismo esta app no usa OpenRouter. Si luego quieres funciones de IA:

- usa GitHub Pages o Render Static Site solo para el frontend
- guarda OPENROUTER_API_KEY en un backend o proxy privado
- no expongas esa clave en variables cliente que empiecen por VITE_

La forma correcta es montar ese proxy en Render como Web Service y que el frontend le haga peticiones a tu propio endpoint.

## Scripts

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Estado móvil

El shell principal ya está ajustado para móvil:

- menú lateral deslizante en pantallas pequeñas
- mejor reparto de espacio en la topbar
- calculadora más compacta
- controles del historial visibles también en móvil
