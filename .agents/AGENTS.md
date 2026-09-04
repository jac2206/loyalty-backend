# Guía de agentes — Loyalty Backend

Este repositorio implementa una API de lealtad con TypeScript, Express 5, PostgreSQL, Awilix, Zod/OpenAPI y Vitest. Sigue DDD y arquitectura hexagonal: el dominio está en el centro y nunca depende de infraestructura.

## Regla operativa: SDD

Todo cambio funcional empieza en `.agents/specs/<capacidad>.spec.md`. No se debe escribir código hasta definir el objetivo, reglas de negocio, contrato HTTP, errores y escenarios verificables. Para cambios que alteren una capacidad existente, actualiza primero su spec y conserva compatibilidad salvo que la spec declare una versión o migración.

Flujo obligatorio:

1. Leer `context.md`, la spec relevante y las instrucciones de la tarea.
2. Crear o actualizar la spec y anotar decisiones de diseño si cambian contratos, datos o límites de capa.
3. Diseñar puertos del dominio, DTOs y esquemas Zod antes de sus adaptadores.
4. Implementar de dentro hacia afuera: domain → application → infrastructure → composición DI.
5. Añadir o adaptar pruebas y documentación OpenAPI en el mismo cambio.
6. Ejecutar `npm run build` y `npm run test:run`; usar cobertura cuando corresponda.

## Lectura obligatoria según la tarea

- Arquitectura y dependencias: `architecture/backend.architecture.md` y `architecture/backend.patterns.md`.
- Código de API, rutas o Swagger: `instructions/backend.instructions.md` y `instructions/api.instructions.md`.
- Pruebas: `instructions/testing.instructions.md` y `testing/strategy.md`.
- Prompts o coordinación con IA: `instructions/ai-agents.instructions.md` y `instructions/prompt.instructions.md`.
- Implementación: la skill pertinente de `skills/`.

## Límites no negociables

- `src/domain` no importa Express, pg, Awilix, Zod, JWT ni módulos de infraestructura.
- Un caso de uso depende de interfaces del dominio, nunca de una clase de repositorio concreta.
- Los controladores no contienen reglas de negocio ni SQL.
- SQL y mapeo de filas viven exclusivamente en repositorios/adaptadores de infraestructura.
- Dependencias nuevas se registran explícitamente en `src/config/container.ts`; con `InjectionMode.CLASSIC`, el nombre del parámetro constructor debe coincidir con la clave registrada.
- Las rutas nuevas de producción se registran con `registerRoute` para que contrato, validación y Swagger no diverjan.
- No exponer secretos, hashes ni variables de entorno en respuestas, logs o documentación.

## Convenciones del repositorio

- Raíz HTTP: `/loyalty`; API versionada: `/loyalty/v1`; Swagger: `/docs`.
- Errores de negocio: `DomainException` con definición central en `src/domain/errors` y composición en `domain-errors.ts`.
- Validación de entrada: esquemas Zod en `src/infraestructure/schemas` y middleware `validate`.
- Pruebas: `test/**/**.spec.ts`, Vitest, patrón Arrange–Act–Assert y dobles de puertos.
- Mantener la grafía de carpetas existente `infraestructure` para no crear rutas paralelas.

## Fuentes de verdad

La spec define el comportamiento esperado; el código y pruebas existentes describen el comportamiento actual. Si hay conflicto, no lo ocultes: actualiza la spec con la decisión y ajusta código, pruebas y OpenAPI de forma atómica.
