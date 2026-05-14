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

El proyecto ya queda preparado para publicarse como sitio estático en GitHub Pages desde la carpeta docs.

1. Ejecuta npm run build:pages.
2. Haz commit de los cambios, incluida la carpeta docs.
3. Haz push a la rama main.
4. En Settings > Pages selecciona Deploy from a branch.
5. Elige main y la carpeta /docs.

Notas:

- En GitHub Pages la app usa hash routing para evitar errores 404 al recargar rutas internas.
- El script build:pages genera docs con la base pública del repositorio y crea .nojekyll.
- GitHub Pages sirve bien el frontend, pero no es un lugar seguro para guardar claves privadas.
- La URL pública actual de este proyecto es https://dofepro-tech.github.io/calc-juti/.

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
- npm run build:pages
- npm run preview
- npm run lint

## Estado móvil

El shell principal ya está ajustado para móvil:

- menú lateral deslizante en pantallas pequeñas
- mejor reparto de espacio en la topbar
- calculadora más compacta
- controles del historial visibles también en móvil
