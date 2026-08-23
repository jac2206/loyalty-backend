# Spec: transacciones de lealtad

**Estado:** comportamiento actual documentado; atomicidad pendiente de endurecer si se requiere consistencia financiera.  
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
7. Una operación de saldo e historial debe ser atómica cuando el requisito de consistencia financiera esté activado en una modificación futura.

## Contratos actuales

| Operación | Ruta | Resultado |
| --- | --- | --- |
| Historial | `GET /loyalty/v1/transactions/{documentType}/{documentNumber}?type=ACUM|REDEM` | 200, `{ transactions }` |
| Acumular | `POST /loyalty/v1/transactions/accumulate` | 201, puntos obtenidos y saldo |
| Redimir | `POST /loyalty/v1/transactions/redeem` | 201, puntos redimidos y saldo |

Todas requieren JWT y scope `user`.

## Aceptación

- Dada una compra válida y cuenta existente, se registra `ACUM` y el saldo aumenta en el cálculo definido.
- Dada una redención válida con saldo suficiente, se registra `REDEM` y el saldo disminuye.
- Dada una redención mayor al saldo, no se persiste una transacción ni cambia el saldo.
- Dado un tipo de filtro inválido, se devuelve 422 de validación.
