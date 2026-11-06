# Arquitectura de Loyalty Backend

## Propósito y alcance

Loyalty Backend es una API HTTP para registrar e identificar usuarios y administrar sus cuentas de puntos: consulta de saldo, acumulación, redención y consulta de transacciones. También conserva un módulo de ejemplo generic, que incluye una consulta de Pokémon a PokeAPI. El backend está implementado con Express 5 y TypeScript; usa PostgreSQL mediante pg.

Esta documentación describe la implementación del backend comprobada en el repositorio. Los clientes web y móvil y parte del hosting se mantienen como contexto declarado en la vista de despliegue reportado; sus repositorios y las cuentas de proveedores no están incluidos aquí. La vista AWS es una propuesta inicial requerida por el formato de arquitectura, no un despliegue actual ni una decisión de migración.

## Vistas

- **Componentes lógicos:** responsabilidades y dependencias del backend, independientes de hosting. [Mermaid](component-diagram.mmd) · [Draw.io editable](component-diagram.drawio).
- **Despliegue actual reportado:** contexto web/móvil, Railway y Supabase documentado previamente como declarado por el usuario. El pipeline y el documento OpenAPI también contienen referencias a Railway; eso confirma configuración en el repositorio, no que el servicio esté activo. [Draw.io](current-deployment.drawio).
- **Infraestructura AWS propuesta:** API Gateway HTTP API, Lambda REQUEST authorizer, Cognito User Pool, integración privada por VPC Link a un NLB interno, backend en EKS y PostgreSQL en RDS. Es un diseño objetivo solicitado; no implica que AWS haya sido escogido o desplegado. [Draw.io editable](aws-infrastructure.drawio).
- **Infraestructura Google Cloud propuesta:** Apigee X con VerifyJWT, conectividad southbound privada mediante Private Service Connect, GKE detras de un balanceador interno y Cloud SQL for PostgreSQL. [Draw.io editable](google-cloud-infrastructure.drawio). Es una propuesta, no un despliegue vigente.
- **Infraestructura Azure propuesta:** API Management con integracion VNet de salida, AKS detras de un balanceador interno y Azure Database for PostgreSQL Flexible Server con acceso privado; Entra External ID se plantea como identidad de clientes. [Draw.io editable](azure-infrastructure.drawio).
- **Archify, arquitectura AWS:** [HTML standalone (fallback manual)](aws-loyalty-architecture.html) y [candidato JSON](../../.archify/architecture-aws-loyalty-20261105-193100/candidate.json).
- **Archify, vista del backend:** [HTML](backend-architecture.html), [candidato JSON](../../.archify/architecture-loyalty-backend-20261102-235430/candidate.json) y [SVG fuente](../../.archify/architecture-loyalty-backend-20261102-235430/diagram.svg).
- **Archify, arquitectura general:** [HTML](general-architecture.html), [candidato JSON](../../.archify/architecture-system-20261103-000049/candidate.json) y [SVG fuente](../../.archify/architecture-system-20261103-000049/diagram.svg). Incluye los clientes web/móvil como reportados y no verificados porque sus repositorios no están en este workspace.

Los HTML Archify publicados en este repositorio usan el fallback manual documentado por Archify: el finalizador CLI fallo al crear un proceso (spawn EPERM). El HTML AWS recien generado no esta finalizado por CLI ni cuenta con validacion automatica de navegador; los recibos conservan el resultado incompleto del intento.

## Verificacion de iconos y presentacion de los diagramas

Se consultaron los catalogos oficiales de [AWS](https://aws.amazon.com/architecture/icons/), [Azure](https://learn.microsoft.com/en-us/azure/architecture/icons/) y [Google Cloud](https://cloud.google.com/icons). Los paquetes descargables actuales son ZIP y esta sesion no pudo inspeccionar su contenido; diagrams.net Desktop tampoco esta disponible para comprobar la biblioteca instalada ni renderizar los archivos. Por eso las tarjetas de servicios sin pictograma se marcan como **Icono no verificado**: AWS (VPC Link v2, Network Load Balancer y RDS for PostgreSQL), Azure (Microsoft Entra External ID y el recurso LoadBalancer interno de AKS) y Google Cloud (Identity Platform, Apigee X y los attachments de PSC). Se conservaron los iconos SVG ya incluidos para API Management, AKS, Azure Database for PostgreSQL, Cloud Load Balancing, GKE y Cloud SQL, con etiquetas editables separadas. Los pictogramas de persona y dispositivos tambien conservan sus etiquetas independientes.

La validacion estructural y geometrica se ejecuto con la version 1.8.7 de la skill. La revision visual renderizada queda pendiente hasta disponer de diagrams.net Desktop.

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

La propuesta AWS coloca el backend en Amazon EKS dentro de una VPC con red privada propuesta. Amazon API Gateway HTTP API recibe las solicitudes y aplica un Lambda REQUEST authorizer en las rutas protegidas; el API se integra de forma privada mediante VPC Link con un Network Load Balancer interno que dirige al Service de EKS. Amazon Cognito User Pool es el emisor de identidad propuesto. Amazon RDS for PostgreSQL conserva la persistencia. El AWS Load Balancer Controller se muestra como componente propuesto para aprovisionar el NLB para EKS; no está configurado en este repositorio.

Hay una brecha de autenticación que impide considerar lista la integración: la aplicación actual emite y valida JWT locales firmados con HS256 y `JWT_SECRET`. Un JWT de Cognito no será aceptado por `JwtAuthService` tal como está. Antes de desplegar el diseño se debe decidir si el backend confiará en los claims verificados que reenvíe el authorizer (y cómo se impide el acceso directo al servicio), validará tokens Cognito de forma compatible o usará un intercambio de tokens. También se debe definir si registro/login se trasladan a Cognito; hoy esas rutas son públicas y el login emite el JWT local. Estos cambios no están implementados.

El patrón API Gateway HTTP API → VPC Link → NLB interno está soportado por la integración privada de API Gateway; el controlador de AWS para Kubernetes puede aprovisionar NLB para servicios EKS tipo LoadBalancer. La región, AZ, subredes, CIDR, listener/TLS, puertos, reglas de seguridad, escalado, disponibilidad, secretos, egress a PokeAPI, copias, observabilidad y recuperación siguen por definir. La topología es una propuesta, no infraestructura desplegada. [Integraciones privadas de API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-private-integration.html) · [Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) · [AWS Load Balancer Controller para EKS](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html).

Las alternativas multi-cloud tambien son propuestas independientes. Google Cloud: Apigee X puede alcanzar backends privados mediante PSC southbound; el diagrama plantea un service attachment en la VPC de GKE, un balanceador interno y Cloud SQL. [Patrones de conectividad southbound de Apigee](https://docs.cloud.google.com/apigee/docs/api-platform/architecture/southbound-networking-patterns-endpoints) ? [VerifyJWT](https://docs.cloud.google.com/apigee/docs/api-platform/reference/policies/verify-jwt-policy) ? [balanceo de carga en GKE](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-load-balancing). Azure: API Management se plantea con integracion VNet de salida hacia el balanceador interno de AKS; PostgreSQL Flexible Server usa acceso privado. Entra External ID representa la identidad de clientes, y APIM requiere validar esos tokens con `validate-jwt`/OIDC porque `validate-azure-ad-token` no admite Entra External ID para clientes. [Integracion de red de APIM](https://learn.microsoft.com/en-us/azure/api-management/virtual-network-concepts?tabs=stv2) ? [politica validate-azure-ad-token](https://learn.microsoft.com/en-us/azure/api-management/validate-azure-ad-token-policy) ? [balanceador interno de AKS](https://learn.microsoft.com/en-in/azure/aks/internal-lb) ? [red de PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-networking).

En AWS, Google Cloud y Azure se mantiene la misma brecha de autenticacion identificada en el codigo: el middleware del backend valida JWT propios HS256, por lo que no confiara automaticamente en tokens Cognito, el emisor OIDC configurado para Apigee ni Entra External ID. Se debe decidir una estrategia compatible de validacion, confianza segura en claims del gateway o intercambio de tokens antes de desplegar cualquiera de las propuestas. Las variantes no representan migraciones implementadas.

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
