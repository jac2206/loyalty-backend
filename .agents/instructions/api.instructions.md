# Rutas, validación y OpenAPI

- Para rutas de negocio, usar `registerRoute`, no `router.get/post` directo.
- Escribir primero el schema Zod y reutilizarlo para `validate` y OpenAPI.
- Validar `body`, `params` y `query` que provengan del cliente. Modelar enums de documento y tipo de transacción de forma consistente.
- Mantener `swaggerPath` relativo a `/loyalty` y URL de ruta relativo al router.
- Declarar la respuesta de creación como `201` mediante `customResponses` o extender el builder si la ruta devuelve 201; no documentar 200 cuando el controller devuelve 201.
- Mantener seguridad alineada: `isProtected: true` solo cuando la ruta realmente ejecuta autenticación JWT. Definir los scopes requeridos en la spec.
- Cualquier modificación a un endpoint existente debe comprobar retrocompatibilidad de request, response y códigos de estado.
