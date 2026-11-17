# Caso de uso: acumular puntos

> **Endpoint:** `POST /loyalty/v1/transactions/accumulate`  
> **Versión:** v1

## Descripción

Calcula puntos a partir de un monto, guarda una transacción `ACUM` y aumenta el saldo de la cuenta.

## Detalles del endpoint

- **Método:** POST
- **Ruta:** `/loyalty/v1/transactions/accumulate`
- **Autenticación:** JWT Bearer con scope `user`
- **Tipo de contenido:** `application/json`

## Actores

- **Cliente autenticado:** solicita acumular una compra.
- **PostgreSQL:** localiza cuenta, inserta transacción y actualiza saldo.

## Precondiciones y prerrequisitos

- Body válido, token válido con scope `user` y cuenta asociada al documento del body.
- `documentNumber` debe coincidir con el `sub` del JWT y la cuenta debe tener `status = true`.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| Content-Type | string | Sí | `application/json`. |
| Authorization | string | Sí | `Bearer <JWT>`. |

### Parámetros de ruta y consulta

No aplica.

### Body

```json
{
  "documentType": "CC",
  "documentNumber": "1037630472",
  "partnerCode": "STORE-01",
  "locationCode": "BOG-01",
  "amount": 12500,
  "reference": "ORDER-123"
}
```

### Detalle de campos

| Campo | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| documentType | string | Sí | Cualquier string según el esquema HTTP. |
| documentNumber | string | Sí | Cualquier string según el esquema HTTP. |
| partnerCode | string | Sí | Cualquier string según el esquema HTTP. |
| locationCode | string | No | Opcional. |
| amount | number | Sí | Positivo según Zod. |
| reference | string | Sí | Mínimo 3 caracteres. |

## Flujo principal

1. Zod valida el body; luego la ruta valida JWT y scope `user`.
2. `TransactionsController.accumulate` pasa el DTO y `sub` a `AccumulatePointsUseCase`.
3. El caso de uso verifica titularidad y monto positivo, calcula `Math.floor(amount / 1000)` y llama `ITransactionRepository.applyPoints`.
4. El repositorio abre una transacción, busca y bloquea la cuenta (`FOR UPDATE`), y rechaza cuenta inexistente o estado distinto de `true`.
5. Inserta `ACUM`, actualiza el saldo y confirma con `COMMIT`; ante fallos ejecuta `ROLLBACK`.
6. El caso de uso construye el DTO y el controlador responde 201.

## Respuestas

### Éxito (201)

```json
{
  "message": "Points accumulated successfully",
  "pointsEarned": 12,
  "balance": 1012
}
```

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | Token inválido o scope insuficiente. |
| 403 | `FORBIDDEN` / `ACCOUNT_DOCUMENT_MISMATCH` / `ACCOUNT_INACTIVE` | Sin scopes, documento ajeno o cuenta inactiva. |
| 404 | `ACCOUNT_NOT_FOUND` | No existe cuenta para el documento. |
| 422 | `VALIDATION_ERROR` | Body no válido. |
| 422 | `TRANSACTION_POINTS_INVALID` | Monto no positivo si llega al caso de uso. |
| 500 | `INTERNAL_SERVER_ERROR` | Error inesperado de persistencia u otro. |

## Reglas específicas

1. Los puntos son la parte entera de `amount / 1000`; montos positivos menores a 1000 generan cero puntos y no son rechazados por la regla del caso de uso.
2. El tipo persistido es `ACUM`; un `locationCode` ausente se convierte en null.
3. El documento debe coincidir con `sub`; el estado `false` o `null` impide acumular.

## Excepciones

Los errores de dominio se serializan mediante `errorMiddleware`. El repositorio ejecuta `ROLLBACK` si falla la operación SQL.

## Diagrama de flujo

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } }}%%
flowchart TB
    classDef statementClass fill:#7f56d9,color:white,stroke:#5d3ba2,stroke-width:2px
    classDef conditionalClass fill:#da0063,color:white,stroke:#b0004e,stroke-width:2px
    classDef inicioClass fill:#00c2a8,color:white,stroke-width:2px,stroke:lightGreen
    classDef finClass fill:black,color:white,stroke-width:2px
    classDef rejectClass fill:#e36236,color:white,stroke:#b00000,stroke-width:2px
    classDef dbClass fill:#3578ff,stroke:blue,stroke-width:2px
    subgraph BACKEND [Flujo backend]
        inicio((Inicio)):::inicioClass
        valid["Validar body, JWT y scope"]:::statementClass
        caso["AccumulatePointsUseCase: titularidad y entrada"]:::statementClass
        titular{"¿Titular y entrada válidos?"}:::conditionalClass
        repo["TransactionRepository.applyPoints: BEGIN y bloqueo"]:::statementClass
        estado{"¿Cuenta activa?"}:::conditionalClass
        guardar["INSERT ACUM y UPDATE saldo"]:::statementClass
        commit["COMMIT"]:::statementClass
        rollback["ROLLBACK"]:::rejectClass
        fallo["Error de validación, autorización o dominio"]:::rejectClass
        ok((201 Acumulación)):::finClass
        error((Error)):::finClass
    end
    subgraph BASE_DE_DATOS [Base de datos]
        db[(PostgreSQL)]:::dbClass
    end
    inicio --> valid
    valid -->|Error| fallo
    valid -->|Correcto| caso --> titular
    titular -->|No| fallo --> error
    titular -->|Sí| repo --> estado
    estado -->|No| rollback --> fallo
    estado -->|Sí| guardar --> commit --> ok
    guardar -->|Error| rollback
    repo -.-> db
    guardar -.-> db
```

## Detalles de implementación

El caso de uso depende de `ITransactionRepository`; `applyPoints` ejecuta SQL parametrizado con un mismo cliente.

**Fuentes:** [ruta](../../../src/infraestructure/http/routes/v1/transactions.routes.ts), [controlador](../../../src/infraestructure/controllers/v1/transactions.controller.ts), [caso de uso](../../../src/application/use-cases/transactions/accumulate-points.usecase.ts), [repositorio transaccional](../../../src/infraestructure/database/repositories/transaction.repository.ts), [repositorio de cuenta](../../../src/infraestructure/database/repositories/account.repository.ts), [esquema](../../../src/infraestructure/schemas/transaction.schema.ts).

## Notas técnicas

### Base de datos

La inserción en `loyalty.transactions` y la actualización de `loyalty.accounts` ocurren dentro de una transacción SQL con bloqueo de fila. La concurrencia y rollback requieren validación adicional con PostgreSQL real.

### Eventos e integraciones

No se observan eventos ni servicios externos.

## Mapeo y validación

`amount` del DTO se almacena como `money_amount`; `locationCode` opcional se mapea a `location_code`. El esquema no enumera el tipo documental.

## Ejemplo

```bash
curl -X POST http://localhost:3000/loyalty/v1/transactions/accumulate \
  -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
  -d '{"documentType":"CC","documentNumber":"1037630472","partnerCode":"STORE-01","amount":12500,"reference":"ORDER-123"}'
```
