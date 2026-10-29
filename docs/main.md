# Loyalty Backend

## Propósito

API HTTP para registrar e identificar usuarios y administrar sus cuentas de puntos: consulta de saldo, acumulación, redención y consulta de transacciones. El servidor está implementado con Express 5 y TypeScript; usa PostgreSQL para los datos de lealtad y JWT para autenticar rutas protegidas.

## Organización técnica observada

- `src/infraestructure/http/routes`: rutas Express versionadas bajo `/loyalty/v1`.
- `src/infraestructure/controllers`: adaptan solicitudes y respuestas HTTP a los casos de uso.
- `src/application/use-cases`: orquestan la lógica de aplicación.
- `src/application/dto`: contratos de entrada y salida de la aplicación.
- `src/domain`: entidades, interfaces, errores y excepciones usadas por la aplicación.
- `src/infraestructure/database/repositories`: consultas PostgreSQL parametrizadas y mapeo de filas.
- `src/config/container.ts`: composición de dependencias Awilix.

Las rutas principales usan `registerRoute` para registrar la ruta y el contrato OpenAPI. Las rutas del módulo de ejemplo `generic` se registran directamente en Express y no usan el middleware común de validación ni el registro OpenAPI.

## Tecnologías y ejecución

El proyecto usa Node.js, TypeScript estricto, Express 5, Awilix, PostgreSQL (`pg`), Zod/OpenAPI, JWT, bcrypt, Winston y Vitest. Los comandos disponibles incluyen `npm run dev`, `npm run build` y `npm run test:run`.

## Autenticación y errores

Las rutas protegidas verifican un JWT Bearer. `JwtAuthService` acepta tokens HS256 de tipo `access`; los tokens emitidos por el login vencen en una hora y llevan el scope `user`. El middleware de scopes permite una ruta si alguno de los scopes requeridos está en el token. CORS permite los orígenes `http://localhost:3000`, `http://localhost:4002` y `https://loyalty-web-mocha.vercel.app`, con credenciales; solicitudes sin `Origin` también pasan la comprobación configurada. Los errores `DomainException` se serializan como `{ "code", "message" }` con su estado; los errores inesperados se responden como 500 `INTERNAL_SERVER_ERROR`.

El servidor declara `bearerAuth` como seguridad global OpenAPI, mientras que las rutas públicas omiten seguridad a nivel de operación; por ello Swagger puede mostrar seguridad heredada que no coincide con los middlewares reales de registro y login.

## Persistencia e integraciones

Los repositorios de usuarios, cuentas y transacciones consultan el esquema `loyalty` en PostgreSQL. Los casos de uso de acumulación y redención guardan una transacción y luego actualizan el saldo mediante consultas separadas; el flujo no abre una transacción SQL. El módulo de ejemplo `generic` consulta/guarda en la tabla `generics` en algunos casos. La consulta de Pokémon llama a la API externa PokeAPI mediante Axios, con timeout configurado en el cliente y un timeout de cuatro segundos para esa petición.

## Índice de casos de uso

### Usuarios

- [Registrar usuario](use-cases/usuarios/registrar-usuario.md)
- [Iniciar sesión](use-cases/usuarios/iniciar-sesion.md)
- [Consultar perfil propio](use-cases/usuarios/consultar-perfil.md)
- [Listar usuarios](use-cases/usuarios/listar-usuarios.md)
- [Actualizar perfil por documento](use-cases/usuarios/actualizar-perfil.md)

### Cuentas

- [Consultar saldo](use-cases/cuentas/consultar-saldo.md)

### Transacciones

- [Acumular puntos](use-cases/transacciones/acumular-puntos.md)
- [Redimir puntos](use-cases/transacciones/redimir-puntos.md)
- [Consultar transacciones](use-cases/transacciones/consultar-transacciones.md)

### Módulo de ejemplo `generic`

- [Obtener Generic de ejemplo](use-cases/generic/obtener-generic.md)
- [Crear Generic de ejemplo](use-cases/generic/crear-generic.md)
- [Consultar Generic por ID](use-cases/generic/consultar-generic-por-id.md)
- [Consultar Pokémon por nombre](use-cases/generic/consultar-pokemon.md)
- [Actualizar Generic de ejemplo](use-cases/generic/actualizar-generic.md)

## Otros endpoints

- `GET /loyalty/health`: endpoint de salud implementado en infraestructura; no corresponde a un caso de uso de `src/application/use-cases`. El registro OpenAPI lo marca protegido, pero la ruta no instala middleware JWT; el controlador responde un estado fijo y no invoca `HealthService`.
- `GET /docs`: interfaz Swagger generada por el servidor. El módulo `generic` no registra sus rutas en ese registro.

## Fuentes y alcance

Esta documentación describe el comportamiento observado en rutas, controladores, casos de uso, esquemas, repositorios, servicios y pruebas. Los detalles de despliegue y el esquema completo de base de datos no están incluidos porque no se derivan de esos componentes.
