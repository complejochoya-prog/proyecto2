# Auditoría técnica inicial — proyecto2

Fecha: 2026-10-08. Rama: `audit/fixes-initial`. Base observada: `main` en `9232f06ef52447b1830b3ab09b1b969807f7830a`.

## Alcance
Inspección estática inicial de React/TypeScript/Vite, router, autenticación, guards, contexto tenant, sincronización Firestore, stores, API y servidor Express/SQLite. Aún no se ejecutaron build, lint ni pruebas, y no se revisaron las reglas de Firestore desplegadas.

## Hallazgos priorizados

### CRÍTICO: autenticación solo en frontend
`src/context/AuthContext.tsx` define usuarios de demostración en el cliente y restaura sesión desde localStorage. Los guards React no protegen la API. `server/index.js` expone CRUD sin middleware de autenticación/autorización visible. No usar con datos reales hasta autenticar y autorizar en servidor.

### CRÍTICO: aislamiento multi-tenant incompleto
El backend fija `negocioId: 'giovanni'` y usa tablas globales; `src/lib/firebaseSync.ts` usa colecciones globales sin partición por negocio. Riesgo de mezcla de datos. Requiere migración coordinada de SQLite, Firestore y reglas de seguridad.

### ALTO: CORS abierto
`server/index.js` usa `app.use(cors())`. Configurar orígenes permitidos por entorno una vez confirmados los dominios.

### ALTO: varias fuentes de persistencia
`src/components/DbSync.tsx` combina Firestore y SQLite; `src/lib/firebaseSync.ts` importa datos locales cuando una colección está vacía. Puede haber carreras y divergencias. Definir una fuente de verdad y estrategia de migración.

### ALTO: URL API por defecto local
`src/lib/api.ts` usa `http://localhost:3001/api` si falta `VITE_API_URL`. En producción, localhost apunta al dispositivo del usuario. Configurar URL por entorno o ruta relativa/proxy.

### ALTO: dependencias sin rango
`package.json` utiliza `*` para Express, CORS y better-sqlite3. Fijar versiones probadas y validar el lockfile.

### MEDIO: IndexedDB
`src/store/idbStorage.ts` no cierra explícitamente conexiones tras operaciones. Mejorar ciclo de vida de conexiones.

### MEDIO: validación de API
Las rutas CRUD no muestran una validación centralizada de esquemas; hay IDs basados en `Date.now()` y errores inconsistentes. Agregar validación, códigos de error uniformes y transacciones para pedidos/ítems.

### MEDIO: PWA
`vite.config.ts` declara iconos que no aparecen en el árbol inicial inspeccionado. Verificar referencias y probar build/rutas de entrada por tenant.

### MEDIO: pruebas
`package.json` no define script de tests. Agregar pruebas de permisos, aislamiento tenant, caja, reservas, pedidos y sincronización.

## Plan
1. Cerrar autenticación/autorización server-side.
2. Aislar datos por negocio en SQLite y Firestore y verificar reglas.
3. Elegir fuente de verdad de persistencia.
4. Fijar dependencias y configurar API/CORS/PWA por entorno.
5. Validar entradas, uniformar errores y agregar pruebas/CI.
6. Ejecutar instalación limpia, lint, build y tests.

Los hallazgos críticos requieren cambios coordinados; no se consideran resueltos por modificar solo la interfaz.