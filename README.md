# FitGlass AI — anteriormente IA KSC

Aplicación web/PWA de nutrición para el proyecto Eureka. Inspirada visualmente en Liquid Glass y en las referencias entregadas, pero implementada desde cero.

## Autores
Diseñada por **Andre y Sebastian**.

Proyecto escolar del IEP El Triunfo Castilla, aula Mateo García Pumacahua, 4.º de secundaria.

En la sección "Sobre FitGlass AI" aparece la opción **¿Quieres saber más de ellos?** y la aplicación solo muestra que los desarrolladores se llaman Andre y Sebastian.

## Archivos
- `index.html` — estructura de toda la app.
- `styles.css` — Liquid Glass, responsive, animaciones y gráficos.
- `app.js` — lógica, perfil, cálculos, cámara, análisis, Coach y almacenamiento local.
- `config.js` — configuración de imagen y APIs.
- `manifest.json` — instalación como PWA.
- `sw.js` — caché offline.

## Publicar en GitHub Pages
1. Sube los archivos a un repositorio.
2. En GitHub activa **Settings → Pages → Deploy from branch**.
3. Abre la URL de GitHub Pages.
4. Para la cámara usa HTTPS (GitHub Pages ya cumple esto).

## Imagen de perfil / imagen en la nube
En `config.js` cambia:

```js
APP_IMAGE_URL: "https://i.imgur.com/TU_IMAGEN.jpg",
```

Puedes usar una URL directa de Imgur u otro CDN. La app también permite subir una imagen local durante el registro del perfil.

## Groq
En `config.js` coloca temporalmente tu clave para una demo local:

```js
GROQ_API_KEY: "TU_CLAVE",
GROQ_MODEL: "llama-3.3-70b-versatile",
```

La app usa el endpoint compatible con OpenAI de Groq para el Coach y un modelo multimodal separado para visión.

### Seguridad MUY IMPORTANTE
Una página estática de GitHub Pages **no puede guardar una API key de forma secreta**. Si colocas una key en `config.js`, cualquier persona puede verla desde el navegador.

Para una exposición escolar, la opción práctica es:
- usar el modo demo sin key, o
- usar un backend/serverless proxy (Cloudflare Worker, Vercel Function, Netlify Function, etc.) y mantener la key en ese backend.

GitHub Actions Secrets tampoco ocultan una key que termine enviada al navegador: si la key se inyecta en el JavaScript final, será visible.

## Modo demostración
La app funciona sin APIs externas gracias a un modo demo:
- Coach local con respuestas limitadas al tema nutricional.
- Foto IA con resultado de demostración.
- Cálculo TMB/TDEE/macros en el navegador.
- Datos guardados en `localStorage`.
- Cámara real (el navegador pedirá permiso).

Esto permite presentar la app incluso si una API falla durante Eureka.

## Cálculos
La app implementa una estimación de:
- TMB con Mifflin-St Jeor.
- TDEE según nivel de actividad.
- Objetivo de calorías para reducir, mantener o ganar masa.
- Proteína, grasas, carbohidratos y agua orientativos.
- IMC.
- Tendencia de peso.

Son cálculos educativos y no sustituyen evaluación profesional.

## Regiones
El perfil tiene exactamente dos opciones:
- **Piura** — contexto educativo enfocado en hidratación y control metabólico.
- **Cusco** — contexto educativo enfocado en hierro, proteína y adaptación a gran altitud.

Los mensajes regionales no representan prevalencias epidemiológicas exactas. Para Eureka puedes incorporar en `app.js` cifras verificadas de fuentes oficiales (INEI, MINSA, INS, ENDES) y mostrar siempre el año y la fuente.

## USDA / Open Food Facts
El proyecto deja la arquitectura preparada, pero no requiere esas APIs para funcionar. Para producción puedes añadir:
- USDA FoodData Central para micronutrientes y alimentos.
- Open Food Facts para códigos de barras.

Recomendación: consulta la API desde backend/proxy para no exponer claves y aplica caché.

## Límites médicos
FitGlass AI **no diagnostica anemia, hemoglobina baja, obesidad, diabetes ni otras enfermedades**. El módulo de salud es preventivo/educativo y debe recomendar evaluación profesional cuando corresponda.

## Navegadores
Chrome/Edge/Safari modernos. Para cámara y PWA usa HTTPS.

## Licencia
Proyecto educativo. Puedes adaptarlo para la exposición de Eureka.


## Archivos adicionales incluidos

- `regional-data.js`: contexto de Piura/Cusco y registro de fuentes.
- `nutrition-engine.js`: motor de cálculos y validaciones.
- `api-clients.js`: clientes para Groq, USDA, Open Food Facts y Open-Meteo, preparados para proxy.
- `ui-effects.js`: efectos Liquid Glass, parallax, ripple y microinteracciones.
- `proxy-worker.example.js`: ejemplo de Cloudflare Worker para no exponer Groq.

## Groq y GitHub Secrets

GitHub Secrets son adecuados para un workflow o backend. No se vuelven automáticamente accesibles a una página GitHub Pages en tiempo de ejecución. Para el navegador se recomienda `GROQ_PROXY_URL` apuntando a un Worker/Function; esa función mantiene `GROQ_API_KEY` en el servidor.

## Modelos

El proyecto deja configurado un modelo de texto y uno multimodal como valores de ejemplo en `config.js`; cámbialos por los nombres de modelo que tu cuenta de Groq tenga habilitados. No dependas de un nombre fijo si Groq cambia el catálogo.

## Imagen de Imgur

Reemplaza `APP_IMAGE_URL` y `HERO_IMAGE_URL` por una URL directa de imagen. La aplicación también permite seleccionar una foto local.

## Presentación de Eureka

Antes de la expo, conviene probar el modo demo, cámara, navegación móvil, URL de imagen y exportación de datos sin internet. La app contiene un fallback local para el Coach y el análisis de comida.


## Guía de exposición

### Antes de la exposición

1. Abre la app desde GitHub Pages.
2. Completa el perfil con datos de prueba.
3. Selecciona Piura y muestra cómo cambia el panel regional.
4. Selecciona Cusco y muestra el módulo de contexto de altitud.
5. Prueba el Coach con preguntas como “¿Qué puedo comer para aumentar mi proteína?”.
6. Prueba una pregunta ajena al tema para mostrar la restricción temática.
7. Activa la cámara y muestra el permiso del navegador.
8. Presiona “Probar análisis demo” para no depender de internet durante el jurado.
9. Guarda una comida y revisa cómo cambia el anillo y el gráfico.
10. Registra dos pesos y abre Progreso.

### Flujo recomendado de demostración

Primero explica que FitGlass AI reúne tres capas: cálculo local, fuentes nutricionales y asistencia IA. Después enseña la personalización regional. Finalmente usa Foto IA y Coach. Este orden ayuda a demostrar que la aplicación sigue funcionando aunque una API esté temporalmente indisponible.

### Seguridad de IA

No se recomienda publicar una clave de Groq dentro del repositorio. La arquitectura incluye `proxy-worker.example.js` para que la clave viva en un servicio serverless. El navegador solo conoce la URL del proxy.

### Limitación de visión

La fotografía puede identificar alimentos, pero la cantidad en gramos es una estimación. Para una medición exacta se requiere pesado del alimento. La interfaz lo declara al usuario.

### Módulo de hemoglobina

El módulo nunca debe presentarse como diagnóstico. Su función es educativa: explicar que un valor de laboratorio puede estar fuera de un umbral orientativo y que el contexto clínico, edad, sexo, altitud y evaluación profesional importan.

### Regionalización

Los textos de Piura y Cusco están pensados como capas de contexto, no como cifras epidemiológicas inventadas. Para una evaluación científica de Eureka, reemplaza los placeholders por cifras oficiales con año, población y fuente.

### Imagen de portada

La app reserva dos propiedades: `APP_IMAGE_URL` y `HERO_IMAGE_URL`. Pega allí la URL directa de Imgur. Si la URL deja de existir, la interfaz conserva un fondo visual generado por CSS.

### Sin emojis

La interfaz evita emojis como iconografía. Usa letras cortas, formas geométricas y SVG para mantener un aspecto uniforme.

### Rendimiento

Los efectos se animan principalmente mediante `transform`, `opacity` y compositing. Los gráficos se generan con SVG y no requieren un motor pesado de charts. Se respeta `prefers-reduced-motion` en la capa visual.

### Datos locales

Los registros se guardan en `localStorage` para que el jurado pueda usar la app sin crear una cuenta. La exportación genera un JSON con el perfil y los datos actuales.

### Restablecer demo

Desde las herramientas del navegador se puede borrar el sitio/almacenamiento local para iniciar el onboarding otra vez.


## GitHub Secrets para la exposición

Crea estos Repository Secrets en **Settings → Secrets and variables → Actions**:

```text
GROQ_API_KEY
USDA_API_KEY
```

El workflow reemplaza automáticamente los marcadores de `config.js` durante la publicación.

### Importante
Este método es válido para el prototipo educativo, pero cualquier clave inyectada en el JavaScript publicado puede ser inspeccionada por el navegador. Para producción se debe usar un proxy/backend.

## Imagen de Imgur

Puedes poner tu URL directa en:

```js
APP_IMAGE_URL: "https://i.imgur.com/xxxxx.jpg"
```

## Modelos

El modelo de Coach y el modelo de visión se pueden cambiar en `config.js`. La aplicación también dispone de respuestas y análisis locales de demostración cuando la API no está disponible.

---

## Versión Plus para Eureka

Esta edición incorpora una segunda capa de demostración llamada **Eureka Lab**. No sustituye los tres módulos principales de la app; los complementa.

### Nuevos módulos

- Panel Eureka: resume perfil, IA, rachas y recomendación local.
- MINSA / INS: fuentes oficiales con enlaces directos.
- Laboratorio de códigos: consulta Open Food Facts y crea productos locales cuando no fue posible darte información.
- Focus Timer: 5, 10, 15 y 25 minutos, pausa, reinicio y sonido opcional.
- Rachas y calendario: diferencia racha diaria de racha perfecta.
- Modo presentación: vista limpia para proyección en la exposición.

### Dos rachas

**Racha diaria:** al menos una actividad registrada en el día.

**Racha perfecta:** en esta versión educativa se exige:

- calorías dentro de ±10 % del objetivo;
- proteína ≥90 % del objetivo;
- agua ≥90 % de la meta.

La app muestra la regla directamente en la pantalla para que el jurado pueda auditar la lógica.

### Código de barras

El orden de búsqueda es:

1. Open Food Facts.
2. Base local del proyecto.
3. Editor manual local.

Cuando no es posible obtener información se muestra el mensaje **“No fue posible darte datos”** y se abre el editor. El producto queda guardado en el navegador y puede exportarse a JSON.

### MINSA / INS

El módulo educativo enlaza documentos y publicaciones oficiales sobre alimentación saludable, exceso de peso, obesidad y prevención/control de anemia. Los indicadores nacionales no se presentan como si fueran prevalencias de Piura o Cusco.

### Permisos

La app puede solicitar:

- notificaciones;
- cámara;
- ubicación.

Cada permiso se solicita solo al usar su función.

### Imagen externa

Para poner una imagen alojada en Imgur u otro CDN, cambia `APP_IMAGE_URL` o `HERO_IMAGE_URL` en `config.js`. La capa Liquid Glass la usa como fondo desenfocado cuando la URL existe.

### Modo demostración

No dependas de una conexión perfecta para la feria. La app mantiene rutas de respaldo locales para Coach, Foto IA y códigos. Las respuestas de IA son mejores cuando Groq está disponible, pero la interfaz no queda inutilizada si la API falla.

### Nota de seguridad de Secrets

GitHub Secrets sirven para el proceso de build, pero si una API key se inyecta finalmente en JavaScript del navegador, deja de ser secreta para quien inspeccione el sitio. Es una limitación de cualquier frontend estático. Para producción, usa un proxy/Worker/Function.


## Firebase — nube y base de datos de respaldo

FitGlass AI ahora usa **Firebase Authentication anónima + Cloud Firestore** como capa de persistencia para el prototipo. El funcionamiento es offline-first: los registros siguen existiendo en `localStorage`, y Firebase los replica cuando hay conexión.

Esto es útil para Eureka porque el sistema puede seguir funcionando aunque una API nutricional no devuelva un resultado. Los productos creados por ustedes se guardan en la colección:

```text
food_database/{barcode}
```

Mientras los datos privados de cada sesión se guardan bajo:

```text
users/{uid}/app/fitglass_state_v1
users/{uid}/app/fitglass_plus_state_v1
```

Firebase recomienda la autenticación anónima para experiencias de onboarding y permite proteger los datos con Security Rules. En este proyecto se usa precisamente para crear una sesión temporal sin pedir una cuenta al estudiante. citeturn934417search2turn934417search9

### Activar Firebase

1. Crea un proyecto en Firebase.
2. Añade una aplicación Web.
3. En Authentication activa **Anonymous**.
4. Crea Cloud Firestore.
5. Publica las reglas de `firestore.rules`.
6. Crea estos GitHub Secrets:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

7. Vuelve a desplegar GitHub Pages.

El workflow inyectará esos valores en `config.js` durante el build.

La documentación actual de Firebase muestra el SDK Web modular y también admite módulos del navegador mediante URLs `gstatic`; esta versión usa ese esquema para que el proyecto siga siendo estático y no necesite Node para funcionar. citeturn934417search1

### Las claves de configuración de Firebase

La configuración Web de Firebase no debe tratarse como un secreto de servidor: el control real se hace mediante Authentication y Security Rules. Los valores se dejan en GitHub Secrets únicamente para que el repositorio no necesite tenerlos escritos en el archivo de configuración.

### Qué pasa cuando una API no encuentra un producto

Flujo implementado:

```text
Código de barras
      ↓
Open Food Facts
      ↓
¿Hay datos?
 ┌────┴────┐
 Sí        No
 ↓          ↓
Ficha     Editor local
            ↓
      Tabla de nutrición
            ↓
        Ayuda de IA
            ↓
   Usuario revisa valores
            ↓
     localStorage + Firebase
```

La IA **no debe inventar datos nutricionales ausentes**. Se usa para normalizar el nombre, unidades y estructura de los datos que el usuario proporciona. Los campos que sigan faltando quedan como faltantes.

### Recuperación de productos

Cuando un código vuelva a aparecer, FitGlass intenta:

1. Open Food Facts.
2. Base local.
3. Base compartida de Firebase.

De esta forma el proyecto puede ir creando su propia colección de productos durante las demostraciones.

### Base editable

Cada producto guardado puede conservar:

- código de barras;
- nombre;
- porción;
- energía;
- proteína;
- carbohidratos;
- grasas;
- fibra;
- sodio;
- fuente;
- usuario que lo creó en la base compartida.

### Limitación de prototipo

Las reglas incluidas son apropiadas para una demostración educativa, no para producción. Una aplicación pública real debería validar campos, limitar escrituras, moderar la base compartida y utilizar una arquitectura de servidor para operaciones sensibles.
