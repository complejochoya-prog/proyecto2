# Auditoría técnica — proyecto2

Fecha: 2026-10-08. Rama de trabajo: `audit/fixes-initial`. PR: https://github.com/complejochoya-prog/proyecto2/pull/1

## Alcance y validación
Revisión estática de React/TypeScript/Vite, router, autenticación, guards, contexto tenant, sincronización Firestore, stores, API y servidor Express/SQLite. Se agregó CI para ejecutar `npm ci`, comprobaciones de sintaxis del servidor y `npm run build` en pull requests y pushes a `main`. La primera ejecución confirmó que la instalación y la sintaxis del servidor pasan, pero el build falla por errores TypeScript preexistentes detallados en la ejecución de GitHub Actions.

## Cambios realizados en la rama
- Corregidas las referencias PWA para usar el `public/favicon.svg` existente en lugar de recursos que no aparecían en el árbol revisado.
- Mejorado el cierre de conexiones IndexedDB tras operaciones y ante cambios de versión.
- Reemplazados comodines `*` de `better-sqlite3`, `concurrently`, `cors` y `express` por rangos compatibles con las versiones que ya estaban fijadas en el lockfile; sincronizados `package.json` y `package-lock.json`.
- Añadido workflow CI de sintaxis del servidor, typecheck y build. La validación detectó errores TypeScript preexistentes que pasan a ser el siguiente objetivo de corrección.

## Hallazgos pendientes prioritarios

### CRÍTICO: autenticación solo en frontend
`src/context/AuthContext.tsx` define usuarios de demostración en el cliente y restaura sesión desde localStorage. Los guards React no protegen la API. `server/index.js` expone operaciones CRUD sin middleware de autenticación/autorización visible. No usar con datos reales hasta autenticar y autorizar en servidor.

### CRÍTICO: aislamiento multi-tenant incompleto
El backend fija `negocioId: 'giovanni'` y usa tablas globales; `src/lib/firebaseSync.ts` usa colecciones globales sin partición por negocio. Riesgo de mezcla de datos. Requiere migración coordinada de SQLite, Firestore y reglas de seguridad.

### ALTO: CORS abierto
`server/index.js` usa `app.use(cors())`. Configurar orígenes permitidos por entorno una vez confirmados los dominios.

### ALTO: varias fuentes de persistencia
`src/components/DbSync.tsx` combina Firestore y SQLite; `src/lib/firebaseSync.ts` intenta sembrar colecciones vacías desde estado local. Puede haber carreras y divergencias. Definir fuente de verdad y estrategia de migración.

### ALTO: URL API por defecto local
`src/lib/api.ts` usa `http://localhost:3001/api` si falta `VITE_API_URL`. En producción, localhost apunta al dispositivo del usuario. Configurar URL por entorno o ruta relativa/proxy.

### MEDIO: validación de API
Las rutas CRUD no muestran validación centralizada de esquemas; hay IDs basados en `Date.now()` y errores inconsistentes. Agregar validación, códigos de error uniformes y transacciones para pedidos/ítems.

### MEDIO: pruebas de negocio ausentes
Aún deben agregarse pruebas de autenticación/autorización, aislamiento tenant, caja, reservas, pedidos y sincronización. El workflow actual es una base de calidad, no reemplaza las pruebas funcionales.

## Plan de remediación
1. Implementar autenticación y autorización server-side antes de exponer operaciones con datos reales.
2. Aislar datos por negocio en SQLite y Firestore, con reglas y pruebas de seguridad.
3. Establecer fuente de verdad y recuperación ante conflictos de sincronización.
4. Configurar API/CORS por entorno y validar entradas en cada ruta.
5. Agregar pruebas de negocio e integrar cambios gradualmente.

Los hallazgos críticos no se consideran resueltos por ajustes de frontend ni por este primer conjunto de mejoras.