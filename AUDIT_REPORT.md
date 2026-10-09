# Auditoría técnica — proyecto2

Fecha: 2026-10-08. Cambios aplicados directamente en `main`. El PR de auditoría quedó cerrado para evitar duplicar los cambios.

## Alcance y validación

Revisión estática de React/TypeScript/Vite, rutas y guards, modelos de datos, stores, sincronización Firestore, API Express y persistencia SQLite.

**CI en `main`: pasó** en la ejecución [37865046391](https://github.com/complejochoya-prog/proyecto2/actions/runs/37865046391):
- `npm ci`
- comprobación de sintaxis JavaScript del servidor
- `npm run build` (TypeScript + bundle de producción)
- `npm run test:smoke` (API y SQLite aislado)

La prueba smoke verifica health, lectura, alta/edición/baja de productos, alta/edición/baja de pedidos con ítems y el snapshot de sincronización. No reemplaza pruebas end-to-end en navegador ni pruebas de concurrencia o seguridad.

## Cambios aplicados en main

- PWA: referencias de iconos alineadas con `public/favicon.svg`.
- IndexedDB: cierre de conexiones tras transacciones y ante cambios de versión.
- Dependencias: se reemplazaron comodines `*` por rangos compatibles con el lockfile y se sincronizaron ambos archivos.
- CI: workflow de calidad con cancelación de ejecuciones antiguas y smoke test de la API.
- Modelos TypeScript: se reconciliaron tipos legacy de canchas/reservas/usuarios con los tipos actuales para recuperar el typecheck. Los campos legacy opcionales son una transición, no una solución de aislamiento multi-tenant.
- API: URL por defecto local en desarrollo y ruta relativa `/api` en producción; encabezados de solicitud fusionados correctamente.
- Backend: CORS configurable por `API_ALLOWED_ORIGINS` en producción y encabezados HTTP defensivos.
- Pedidos: operaciones de creación y actualización con ítems dentro de transacciones SQLite, para evitar pedidos parciales si falla una escritura.
- Errores: respuestas JSON uniformes para rutas API desconocidas y errores de validación/SQLite.
- Configuración: agregado `.env.example`; completar los orígenes reales antes de desplegar.

## Hallazgos pendientes prioritarios

### CRÍTICO — autenticación y autorización del servidor

`src/context/AuthContext.tsx` mantiene usuarios/contraseñas/PIN de demostración en el frontend y restaura sesión desde `localStorage`. Los guards de React solo protegen la interfaz. Las rutas CRUD de `server/index.js` todavía no exigen una identidad autenticada ni aplican roles en el servidor.

**No desplegar con datos reales ni exponer la API a Internet hasta implementar autenticación/autorización server-side.** La configuración CORS no sustituye autenticación.

### CRÍTICO — aislamiento multi-tenant incompleto

El backend usa tablas globales y asigna `negocioId: 'giovanni'` en algunos resultados. `src/lib/firebaseSync.ts` utiliza colecciones globales (`productos`, `mesas`, `reservas`, `clientes`, `pedidos`) sin partición por negocio visible. Esto puede mezclar datos entre negocios.

Hace falta una migración coordinada de SQLite, Firestore, reglas de seguridad y pruebas de aislamiento antes de habilitar varios negocios.

### ALTO — Firestore y SQLite compiten como fuentes de verdad

`src/components/DbSync.tsx` combina ambas persistencias y `src/lib/firebaseSync.ts` intenta sembrar colecciones vacías desde el estado local. Pueden producirse carreras, escrituras duplicadas o divergencias. Hay que elegir una fuente de verdad y definir reconciliación/reintentos.

### ALTO — CORS depende de configuración de despliegue

En producción, definir `API_ALLOWED_ORIGINS` con los orígenes exactos del frontend. Si frontend y API están en dominios distintos, también definir `VITE_API_URL`. CORS limita el acceso desde navegadores; no bloquea clientes HTTP directos ni protege datos sin autenticación.

### MEDIO — validación de entradas incompleta

Se añadieron respuestas de error consistentes y transacciones para pedidos/ítems, pero todavía falta validación de esquema y reglas de negocio en todas las rutas CRUD, incluidos importes, estados, fechas y referencias.

### MEDIO — vulnerabilidades de dependencias

La instalación de dependencias reportó 6 avisos de seguridad (4 altos y 2 críticos). Deben identificarse los paquetes afectados con `npm audit` y actualizarse de forma controlada, sin usar actualizaciones forzadas que puedan romper la aplicación.

### MEDIO — cobertura funcional todavía parcial

El smoke test cubre API/SQLite básicos. Faltan pruebas automatizadas de reservas y disponibilidad, caja, permisos por rol, sincronización y conflictos offline, además de pruebas end-to-end de los flujos principales.

## Próximos pasos recomendados

1. Implementar autenticación y autorización server-side y migrar el login de demostración.
2. Diseñar el aislamiento multi-tenant en SQLite/Firestore y añadir reglas de seguridad.
3. Definir fuente de verdad, sincronización y recuperación ante conflictos.
4. Agregar validación por ruta y pruebas de negocio/end-to-end.
5. Resolver los avisos de seguridad de dependencias tras revisar el árbol de advisories.

El build y el smoke test actuales pasan; los hallazgos críticos de autenticación y aislamiento multi-tenant siguen abiertos.
