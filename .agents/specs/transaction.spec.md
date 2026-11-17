# Spec: transacciones de lealtad

**Estado:** cambio de seguridad y atomicidad en implementación.
**Propietario de dominio:** Transacciones y Cuentas.

## Objetivo

Registrar acumulaciones y redenciones, actualizar saldo y consultar historial.

## Reglas

1. `amount` para acumular y `points` para redimir deben ser positivos.
2. Acumular otorga `floor(amount / 1000)` puntos y crea una transacción `ACUM`.
3. Redimir exige saldo suficiente, descuenta los puntos y crea una transacción `REDEM`; `amount = points * 100`.
4. Una cuenta inexistente devuelve `ACCOUNT_NOT_FOUND` (404).
5. Saldo insuficiente devuelve `INSUFFICIENT_POINTS` (422).
6. El filtro de historial solo permite `ACUM` o `REDEM`.
7. La comprobación de estado y saldo, la escritura del historial y la actualización de saldo son una sola transacción PostgreSQL; se bloquea la cuenta hasta completar la operación.
8. El documento solicitado debe coincidir con el `sub` del JWT en historial, acumulación y redención; de lo contrario se responde 403 `ACCOUNT_DOCUMENT_MISMATCH` antes de acceder a datos.
9. Las cuentas inactivas o con estado nulo rechazan acumulación y redención con 403 `ACCOUNT_INACTIVE`. La actualización de estado y las operaciones de puntos se serializan por la fila de cuenta.
10. Si falla cualquier escritura, se revierte tanto el historial como el saldo. Redenciones simultáneas no deben producir saldo negativo.

## Contratos actuales

| Operación | Ruta | Resultado |
| --- | --- | --- |
| Historial | `GET /loyalty/v1/transactions/{documentType}/{documentNumber}?type=ACUM|REDEM` | 200, `{ transactions }` |
| Acumular | `POST /loyalty/v1/transactions/accumulate` | 201, puntos obtenidos y saldo |
| Redimir | `POST /loyalty/v1/transactions/redeem` | 201, puntos redimidos y saldo |

Todas requieren JWT y scope `user`.
La documentación OpenAPI de acumulación y redención declara el éxito real con 201 y el esquema de respuesta correspondiente; no declara 200 como éxito para esas operaciones.

## Aceptación

- Dada una compra válida y cuenta existente, se registra `ACUM` y el saldo aumenta en el cálculo definido.
- Dada una redención válida con saldo suficiente, se registra `REDEM` y el saldo disminuye.
- Dada una redención mayor al saldo, no se persiste una transacción ni cambia el saldo.
- Dado un tipo de filtro inválido, se devuelve 422 de validación.
- Dado un documento diferente al del token, cada operación responde 403 sin consultar ni modificar datos.
- Las operaciones concurrentes sobre la misma cuenta respetan el orden de bloqueo y no aplican puntos a una cuenta desactivada antes de adquirir el bloqueo.
- Ante error al insertar historial o actualizar saldo, ninguna de las dos escrituras persiste.
