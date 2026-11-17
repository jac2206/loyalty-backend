# Spec: cuenta y saldo

**Estado:** comportamiento actual documentado.  
**Propietario de dominio:** Cuentas.

## Objetivo

Consultar el saldo de puntos de la cuenta asociada a un documento.

## Contrato

`GET /loyalty/v1/accounts/balance/{documentType}/{documentNumber}` requiere JWT y scope `user`. `documentType` admite `CC`, `CE`, `NIT` o `PT`. Responde 200 con `documentType`, `documentNumber` y `balance` numérico.

## Reglas y errores

- Si no existe una cuenta para el documento, responder `ACCOUNT_NOT_FOUND` (404).
- El saldo es de solo lectura en esta capacidad; sus mutaciones las realizan transacciones.

## Aceptación

- Dada una cuenta existente, devuelve su saldo sin alterar estado.
- Dado un documento sin cuenta, devuelve 404 con el código estable.
- Dado un tipo de documento fuera del enum, la validación responde 422.

## Ampliación solicitada: administración de cuentas

**Estado:** en implementación; sin verificar. La solicitud se refiere a las cuentas de puntos de `loyalty.accounts`, una por usuario, no a las entidades de empresas.

### Evidencia y límites actuales

- Antes de la ampliación, el registro persistía el usuario sin crear una cuenta de puntos.
- El JWT emitido actualmente usa el documento como `sub` y solo incluye el scope `user`; no hay un mecanismo identificado para emitir un scope administrativo.
- La consulta de saldo busca por documento y requiere JWT y scope `user`; la versión ampliada comprueba la titularidad en el caso de uso.
- Las acumulaciones y redenciones modifican el saldo mediante el flujo de transacciones. La consulta de cuenta no modifica puntos.
- El esquema proporcionado define un `user_id` único y un saldo obligatorio, pero no documenta valores por defecto ni migraciones para estas columnas.

### Reglas y contratos nuevos

- El registro crea automáticamente una cuenta activa con saldo inicial cero en la misma operación atómica que el usuario. Se mantiene la respuesta HTTP actual del registro.
- Cada usuario autenticado con scope `user` solo administra su propia cuenta, identificada mediante el `sub` del token.
- `GET /loyalty/v1/accounts/me` devuelve `id`, `userId`, `pointsBalance`, `status` y fechas de creación y actualización, con valores nulos donde la tabla los permita.
- `PATCH /loyalty/v1/accounts/me/status` recibe `{ "status": true|false }` y devuelve la cuenta; no modifica el saldo.
- Una cuenta inexistente devuelve `ACCOUNT_NOT_FOUND` (404). Una cuenta inactiva rechaza acumulaciones y redenciones con `ACCOUNT_INACTIVE` (403). El historial y la consulta de saldo siguen disponibles.
- La ruta existente de saldo conserva su URL y respuesta, pero rechaza documentos que no coincidan con el titular autenticado con 403.
- La autorización de consulta de saldo pertenece al caso de uso; el controlador solo pasa el documento autenticado.
- La consulta de la cuenta propia y el cambio de estado se implementan en casos de uso separados, cada uno con un método público `execute`; ambos conservan sus contratos HTTP.
- No se permite modificar puntos directamente a través de las APIs de cuentas.

### Aceptación de la ampliación

- El registro crea usuario y cuenta activa con saldo cero, o no persiste ninguno si falla la creación.
- El titular puede consultar y cambiar el estado de su cuenta; otro usuario no puede consultar su saldo usando su documento.
- Una cuenta inexistente responde 404 y una solicitud de estado inválida responde 422.
- Una cuenta inactiva no permite acumular ni redimir; reactivarla permite nuevamente esas operaciones.
- La ruta de saldo conserva su respuesta para el titular.

### Verificación pendiente

- Validar unicidad de cuenta por usuario, controles de acceso, compatibilidad de la ruta actual y contratos OpenAPI mediante pruebas.
- `npm run build`: aprobado. `npm run test:run`: 101 pruebas aprobadas, incluyendo casos de titularidad, adaptador transaccional y OpenAPI.
- Las pruebas usan dobles: falta verificar en PostgreSQL real la creación atómica, restricciones y compatibilidad con el esquema desplegado, así como probar las rutas HTTP y OpenAPI completas.
- La comprobación de estado, inserción de historial y actualización de saldo usan una única transacción con bloqueo de fila. Hay pruebas con dobles, incluida una espera de bloqueo simulada; falta verificar concurrencia y rollback con PostgreSQL real.
- Los usuarios existentes sin cuenta no reciben una automáticamente; no se ejecutó ninguna migración ni carga de datos.
- La ruta de saldo y las rutas de transacciones rechazan con 403 documentos ajenos mediante comprobación en los casos de uso.
- El estado `null` se trata como inactivo para acumulación y redención.
