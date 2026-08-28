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
