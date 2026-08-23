# Arquitectura backend: DDD + hexagonal

## Capas

```text
HTTP / Swagger / PostgreSQL / JWT / APIs externas
                │ implementan o adaptan
                ▼
Infrastructure: routes → middleware → controller → repository/adapter
                │ invoca
                ▼
Application: use cases + DTOs
                │ depende de puertos y modelo
                ▼
Domain: entities + repository/service/adapter interfaces + errors
```

`src/config/container.ts` es el composition root: conecta implementaciones de infraestructura con los parámetros que los casos de uso solicitan.

## Responsabilidades por carpeta

| Ubicación | Contenido permitido |
| --- | --- |
| `src/domain/entities` | Entidades y comportamiento invariante sin I/O. |
| `src/domain/interfaces` | Puertos: repositorios, servicios, adaptadores y contratos de casos de uso. |
| `src/domain/errors`, `exceptions` | Catálogo de errores y `DomainException`. |
| `src/application/dto` | Tipos de entrada/salida de casos de uso; no tipos Express. |
| `src/application/use-cases` | Orquestación de reglas y puertos; sin SQL ni detalles HTTP. |
| `src/infraestructure/database` | Pool PostgreSQL, SQL parametrizado y mapeo fila ↔ entidad. |
| `src/infraestructure/http` | Rutas, middleware HTTP, cliente HTTP. |
| `src/infraestructure/controllers` | Traducción HTTP ↔ DTO y códigos de éxito. |
| `src/infraestructure/schemas` | Validación y contrato Zod/OpenAPI. |
| `src/infraestructure/docs` | Registro y generación OpenAPI. |
| `src/config` | Entorno y composición de dependencias. |

## Dirección de dependencias

Permitido: infraestructura → aplicación → dominio; aplicación → interfaces/entidades/errores del dominio. No permitido: dominio → aplicación/infraestructura, ni aplicación → Express/pg/Awilix.

## Secuencia para una nueva capacidad

1. Define el lenguaje ubicuo, reglas y escenarios en una spec.
2. Crea entidad o amplíala solo si el concepto es de dominio.
3. Define el puerto de repositorio/servicio y el contrato del caso de uso en `domain/interfaces`.
4. Implementa DTO y caso de uso en aplicación.
5. Implementa el adaptador o repositorio PostgreSQL.
6. Registra las clases en Awilix y respeta los nombres de constructor.
7. Añade controller, esquema Zod y ruta documentada.
8. Prueba cada borde relevante.
