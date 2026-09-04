# Estrategia de pruebas

## Pirámide

1. **Unitarias de aplicación (prioridad):** reglas de negocio y orquestación con puertos simulados.
2. **Unitarias de infraestructura:** controladores, middlewares, JWT, cliente HTTP, repositorios con `pool` mockeado.
3. **Integración selectiva:** servidor Express con Supertest y, cuando se habilite explícitamente, PostgreSQL efímero para transacciones y SQL crítico.

## Matriz mínima por cambio

| Cambio | Pruebas requeridas |
| --- | --- |
| Regla de negocio | éxito, cada rechazo y ausencia de efectos secundarios. |
| Endpoint | validación, auth/authorización, status y body. |
| Repositorio SQL | parámetros, mapeo y caso sin filas. |
| Error nuevo | caso de uso y serialización por middleware. |
| Cambio de contrato | schema, OpenAPI y prueba de integración/controlador. |

## Comandos

`npm run test:run` es la verificación base. `npm run test:coverage` genera cobertura V8 (`text`, `html`, `lcov`) sobre la lógica configurada; la configuración excluye rutas, DTOs, entidades y composición.
