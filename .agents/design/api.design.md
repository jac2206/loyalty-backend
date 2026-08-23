# Diseño de API

## Convenciones

- Base: `/loyalty`; recursos de negocio: `/loyalty/v1/<recurso>`.
- JSON de entrada y salida; `Content-Type: application/json`.
- Éxitos: `200` para consultas, `201` para creaciones/operaciones que crean una transacción.
- Errores: `{ "code": "STABLE_CODE", "message": "safe message" }`.
- Autenticación Bearer JWT: `Authorization: Bearer <token>`.

## Contrato antes de código

Cada endpoint nuevo o cambiado debe dejar claro en su spec: método, path, autorización/scopes, parámetros, body, éxito, todos los errores y ejemplos. Tras ello, su schema Zod es la fuente ejecutable de validación y se registra en OpenAPI.

## Registro de rutas documentadas

Usar `registerRoute(router, registry, ...)`. Declarar `swaggerPath` con parámetros entre llaves, schemas de body/params/query, `responseSchema`, `isProtected` y middlewares en este orden: validación, autenticación, autorización.

```ts
registerRoute(router, registry, {
  method: "post",
  path: "/example",
  swaggerPath: "/v1/examples/example",
  tag: "Examples",
  bodySchema: exampleRequestSchema,
  responseSchema: exampleResponseSchema,
  isProtected: true,
  middlewares: [validate({ body: exampleRequestSchema }), authenticateJWT, authorizeScopes(["user"])],
  handler: async (req, res) => container.resolve<ExampleController>("exampleController").create(req, res)
});
```

## Swagger

- UI: `/docs`; documento generado en arranque por `generateSwagger()`.
- Definir todos los schemas importados por una ruta en `src/infraestructure/schemas`.
- Ajustar `customResponses` para errores de dominio relevantes (404, 409, etc.).
- No usar Swagger como sustituto de la spec: Swagger describe el contrato HTTP; la spec captura propósito, reglas y decisiones.
