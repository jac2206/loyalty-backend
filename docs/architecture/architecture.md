# Arquitectura de Loyalty Backend

## Propósito y alcance

Loyalty Backend es una API HTTP para registrar e identificar usuarios y administrar sus cuentas de puntos: consulta de saldo, acumulación, redención y consulta de transacciones. También conserva un módulo de ejemplo generic, que incluye una consulta de Pokémon a PokeAPI. El backend está implementado con Express 5 y TypeScript; usa PostgreSQL mediante pg.

Esta documentación describe la implementación del backend comprobada en el repositorio. Los clientes web y móvil y parte del hosting se mantienen como contexto declarado en la vista de despliegue reportado; sus repositorios y las cuentas de proveedores no están incluidos aquí. La vista AWS es una propuesta inicial requerida por el formato de arquitectura, no un despliegue actual ni una decisión de migración.

## Vistas

- **Componentes lógicos:** responsabilidades y dependencias del backend, independientes de hosting. [Mermaid](component-diagram.mmd) · [Draw.io editable](component-diagram.drawio).
- **Despliegue actual reportado:** contexto web/móvil, Railway y Supabase documentado previamente como declarado por el usuario. El pipeline y el documento OpenAPI también contienen referencias a Railway; eso confirma configuración en el repositorio, no que el servicio esté activo. [Draw.io](current-deployment.drawio).
- **Infraestructura AWS propuesta:** backend en App Runner y PostgreSQL en RDS. No implica que AWS haya sido escogido o desplegado. [Draw.io editable](aws-infrastructure.drawio).
- **Archify, vista del backend:** [HTML](backend-architecture.html), [candidato JSON](../../.archify/architecture-loyalty-backend-20261102-235430/candidate.json) y [SVG fuente](../../.archify/architecture-loyalty-backend-20261102-235430/diagram.svg).
- **Archify, arquitectura general:** [HTML](general-architecture.html), [candidato JSON](../../.archify/architecture-system-20261103-000049/candidate.json) y [SVG fuente](../../.archify/architecture-system-20261103-000049/diagram.svg). Incluye los clientes web/móvil como reportados y no verificados porque sus repositorios no están en este workspace.

Ambos HTML usan el fallback manual documentado por Archify: el finalizador CLI falló al crear un proceso (spawn EPERM), así que no tienen recibos de finalización ni validación automática de navegador.

## Componentes e interacción

src/server.ts crea la aplicación Express, instala JSON, CORS, alcance de Awilix y manejo de errores y monta /docs, /loyalty/health y /loyalty/v1. Las rutas v1 agrupan generic, users, accounts y transactions. Sus controladores llaman casos de uso registrados en src/config/container.ts; los repositorios ejecutan consultas parametrizadas con pg.

Las rutas principales de usuarios, cuentas y transacciones validan solicitudes con Zod y, según la operación, exigen JWT Bearer y el scope user. El registro y el login son públicos. El JWT se firma con HS256 y vence en una hora. El módulo generic tiene middleware diferente: su listado exige uno de los scopes generic o user; crear, consultar por ID, consultar Pokémon y actualizar no instalan autenticación ni validación de ruta. No se debe interpretar la declaración global bearerAuth de OpenAPI como aplicación uniforme de seguridad efectiva.

Los repositorios de lealtad consultan loyalty.users, loyalty.accounts y loyalty.transactions. GenericRepository consulta generics sin prefijo de esquema; no se documenta como parte del modelo de lealtad. Acumulación y redención guardan primero la transacción y luego actualizan el saldo mediante llamadas separadas al repositorio; los casos de uso no abren una transacción SQL.

El caso generic para Pokémon pasa por PokeApiAdapter y un cliente Axios; solicita https://pokeapi.co/api/v2/pokemon/:name con timeout de 4 segundos y transforma la respuesta en nombre, altura y peso.

## Interfaces HTTP observadas

Las rutas de negocio se montan bajo /loyalty/v1; registro y login son públicos y las operaciones principales restantes aplican las barreras indicadas en users.routes.ts, accounts.routes.ts y transactions.routes.ts.

| Método | Ruta | Acceso configurado |
| --- | --- | --- |
| POST | /users/register | Público |
| POST | /users/login | Público |
| GET | /users/me | JWT + scope user |
| GET | /users | JWT + scope user |
| PATCH | /users/:documentNumber | JWT + scope user |
| GET | /accounts/balance/:documentType/:documentNumber | JWT + scope user |
| GET | /transactions/:documentType/:documentNumber | JWT + scope user |
| POST | /transactions/accumulate | JWT + scope user |
| POST | /transactions/redeem | JWT + scope user |

El módulo adicional /loyalty/v1/generic se registra directamente en Express y no participa en el registro OpenAPI común. /loyalty/health responde por una ruta separada. /docs sirve Swagger UI.

## Datos, configuración y despliegue

El pool PostgreSQL recibe su cadena de conexión desde DATABASE_URL; el código configura SSL con rejectUnauthorized: false. El proveedor, la región, el esquema instalado y la ubicación real de la base de datos no se pueden determinar desde ese código. No se leyó .env ni se copiaron valores secretos.

docker-compose.yml define un ejemplo local de contenedores app y db con PostgreSQL 15; no acredita que ese compose se use en producción. azure-pipelines.yml configura etapas de pruebas, build, Sonar y un comando railway up para master. OpenAPI contiene una URL de producción en Railway. Son evidencias de configuración y destino declarado por el repositorio, no verificación de una ejecución vigente. Supabase, Vercel y el APK se conservan únicamente como declaraciones del material previo y no se pudieron corroborar en este backend.

La propuesta AWS coloca la API en AWS App Runner y PostgreSQL en Amazon RDS. El repositorio no define región, VPC, subredes, reglas de red, tamaños, alta disponibilidad, copias, dominio, secretos ni política de recuperación; esos detalles no se representan como existentes.

## Seguridad y operación

El código configura CORS con una lista de orígenes permitidos, permite solicitudes sin Origin, credenciales, análisis JSON, validación Zod en rutas registradas, verificación JWT/scope en rutas seleccionadas y errores centralizados. La clave JWT tiene un valor de respaldo "secret" si no se configura JWT_SECRET; el código de configuración permite documentar este comportamiento, pero no demuestra el valor efectivo en un entorno. SSL de PostgreSQL está configurado sin validar la CA (rejectUnauthorized: false). Estos detalles requieren revisión antes de considerar endurecimiento de producción.

El servidor inicia escuchando antes de verificar conexión a base de datos. Aunque connectDatabase termina el proceso ante fallo de SELECT 1, el catch adicional de main.ts solo imprime un mensaje. El apagado ante SIGINT y SIGTERM cierra servidor y pool. Se configuran logs con Winston; infraestructura de métricas, alertas, backups y recuperación no aparece en los archivos inspeccionados.

## Límites y puntos pendientes

- Confirmar con evidencia de despliegue el estado actual y los proveedores de web, móvil y base de datos; el workspace solo verifica código y configuración.
- Revisar las diferencias entre el middleware efectivo y la seguridad global declarada en Swagger, en particular las rutas generic y health.
- Evaluar la configuración de secretos y TLS PostgreSQL antes de producción.
- Hacer atómica la actualización de puntos y el registro de la transacción si el requisito de consistencia de negocio lo exige.
- La propuesta AWS requiere decisiones explícitas de red, disponibilidad, respaldo, observabilidad y gestión de secretos.

## Evidencia de implementación

- Inicio Express, middleware y montaje: src/server.ts.
- Registro de módulos HTTP: src/infraestructure/http/routes/v1/index.ts.
- Composición de casos de uso, servicios y repositorios: src/config/container.ts.
- Autenticación, scopes y JWT: src/infraestructure/http/middlewares/auth.middleware.ts, src/infraestructure/http/middlewares/scope.middleware.ts, src/infraestructure/security/jwt-auth.service.ts.
- PostgreSQL y repositorios: src/infraestructure/database/postgres.ts y src/infraestructure/database/repositories/.
- PokeAPI: src/infraestructure/adapters/poke-api.adapter.ts y src/infraestructure/http/http-client.ts.
- Ejecución y configuración de hosting: docker-compose.yml, azure-pipelines.yml, src/infraestructure/docs/swagger.ts.
