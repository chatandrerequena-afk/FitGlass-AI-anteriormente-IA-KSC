# Firebase rápido para FitGlass AI

## Authentication
Activa:

- Authentication
- Sign-in method
- Anonymous

Firebase documenta `signInAnonymously()` para crear una sesión temporal que puede quedar protegida por Security Rules. citeturn934417search2

## Firestore
Crea una base Cloud Firestore.

Publica `firestore.rules`.

## Web app
En Project settings > Your apps > Web app copia:

- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

Puedes guardarlos en GitHub Secrets con los nombres del README y del workflow.

## Verificación
Cuando la web cargue correctamente y el navegador complete el acceso anónimo, el módulo Firebase queda conectado y la sincronización se hace en segundo plano.

## Producto nuevo
Al no encontrar un código:

1. aparece el editor;
2. pegas la tabla nutricional;
3. puedes pulsar `Mejorar ficha con IA`;
4. revisas la información;
5. guardas;
6. se almacena localmente y en `food_database/{barcode}`.
