# Contexto del producto

## Propósito

Loyalty Backend administra una cuenta de puntos por usuario. Permite registrar e identificar usuarios, consultar saldo, acumular puntos por compras, redimirlos y consultar su historial.

## Capacidades actuales

| Capacidad | Responsabilidad |
| --- | --- |
| Usuarios | Registro, inicio de sesión JWT, perfil y listado protegido. |
| Cuentas | Consulta de saldo por tipo y número de documento. |
| Transacciones | Acumulación, redención e historial filtrable por tipo. |
| Salud | Verificación básica del servicio. |
| Generic | Módulo de ejemplo/chasis; no debe guiar nuevas capacidades de negocio. |

## Modelo de negocio actual

- Un usuario se identifica por `documentType` (`CC`, `CE`, `NIT`, `PT`) y `documentNumber`.
- Una cuenta pertenece a un usuario y mantiene `points_balance`.
- Una transacción es `ACUM` o `REDEM`, está asociada a una cuenta, partner, ubicación opcional, referencia, puntos y monto monetario.
- La acumulación calcula `floor(amount / 1000)` puntos.
- La redención exige puntos positivos y saldo suficiente; su monto es `points * 100`.
- Los tokens incluyen `sub` con el número de documento y actualmente se emiten con el scope `user`.

## Tecnologías y comandos

- Node.js, TypeScript estricto, Express 5, Awilix, pg, Zod 4, `@asteasolutions/zod-to-openapi`, JWT, bcrypt y Winston.
- `npm run dev`, `npm run build`, `npm start`, `npm run test:run`, `npm run test:coverage`.
- PostgreSQL usa `DATABASE_URL`; el esquema de negocio usado en SQL es `loyalty`.

## Riesgos conocidos que deben considerarse en nuevas specs

- Acumulación/redención insertan la transacción y modifican el saldo en operaciones separadas; una spec que requiera atomicidad debe exigir una transacción de PostgreSQL.
- Los contratos reales de User, Account y Transaction sí están documentados por Swagger; el módulo Generic no lo está de forma consistente.
- `/health` está marcado como protegido en OpenAPI, pero no aplica middleware JWT. Si se toca, decidir y alinear comportamiento y documentación.
- El CORS permitido está definido en `src/server.ts`; cambios de origen requieren decisión explícita de seguridad.
