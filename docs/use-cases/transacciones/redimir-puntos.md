# Caso de uso: redimir puntos

> **Endpoint:** `POST /loyalty/v1/transactions/redeem`  
> **Versión:** v1

## Descripción

Comprueba que el usuario tenga una cuenta y saldo suficiente, guarda una transacción `REDEM` y resta los puntos.

## Detalles del endpoint

- **Método:** POST
- **Ruta:** `/loyalty/v1/transactions/redeem`
- **Autenticación:** JWT Bearer con scope `user`
- **Tipo de contenido:** `application/json`

## Actores

- **Cliente autenticado:** solicita la redención.
- **PostgreSQL:** busca cuenta y saldo, registra la transacción y actualiza el saldo.

## Precondiciones y prerrequisitos

- Body válido, token válido con scope `user`, cuenta existente y saldo al menos igual a los puntos solicitados.
- `documentNumber` debe coincidir con `sub` y la cuenta debe estar activa.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| Authorization | string | Sí | `Bearer <JWT>`. |
| Content-Type | string | Sí | `application/json`. |

### Parámetros de ruta y consulta

No aplica.

### Body

```json
{
  "documentType": "CC",
  "documentNumber": "1037630472",
  "partnerCode": "STORE-01",
  "locationCode": "BOG-01",
  "points": 20,
  "reference": "ORDER-124"
}
```

### Detalle de campos

| Campo | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| documentType | string | Sí | Cualquier string según Zod. |
| documentNumber | string | Sí | String. |
| partnerCode | string | Sí | String. |
| locationCode | string | No | Opcional. |
| points | number | Sí | Positivo según Zod. |
| reference | string | Sí | Mínimo 3 caracteres. |

## Flujo principal

1. La ruta valida body, JWT y scope `user`.
2. `TransactionsController.redeem` pasa el DTO y `sub` a `RedeemPointsUseCase`.
3. El caso de uso comprueba titularidad y puntos positivos y llama `ITransactionRepository.applyPoints` con `amount = points * 100`.
4. El repositorio abre una transacción, localiza y bloquea la cuenta, y verifica estado y saldo.
5. Si procede, inserta `REDEM`, actualiza el saldo y confirma con `COMMIT`; ante fallos ejecuta `ROLLBACK`.
6. El caso de uso construye el DTO y el controlador responde 201.

## Respuestas

### Éxito (201)

```json
{
  "message": "Points redeemed successfully",
  "pointsRedeemed": 20,
  "balance": 980
}
```

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | Token inválido o scope insuficiente. |
| 403 | `FORBIDDEN` / `ACCOUNT_DOCUMENT_MISMATCH` / `ACCOUNT_INACTIVE` | Sin scopes, documento ajeno o cuenta inactiva. |
| 404 | `ACCOUNT_NOT_FOUND` | No existe una cuenta asociada al documento. |
| 422 | `VALIDATION_ERROR` | Body no válido. |
| 422 | `TRANSACTION_POINTS_INVALID` | Puntos no positivos si llegan al caso de uso. |
| 422 | `INSUFFICIENT_POINTS` | Saldo menor al solicitado. |
| 500 | `INTERNAL_SERVER_ERROR` | Error inesperado. |

## Reglas específicas

1. El monto monetario registrado se calcula como `points * 100`.
2. La transacción queda con tipo `REDEM`; una ubicación ausente se guarda como null.
3. La cuenta se bloquea durante la comprobación de saldo y las escrituras.

## Excepciones

El repositorio ejecuta `ROLLBACK` ante un fallo durante las escrituras; los errores inesperados se responden como 500.

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
        caso["RedeemPointsUseCase: titularidad y entrada"]:::statementClass
        titular{"¿Titular y entrada válidos?"}:::conditionalClass
        repo["TransactionRepository.applyPoints: BEGIN y bloqueo"]:::statementClass
        estado{"¿Cuenta activa y saldo suficiente?"}:::conditionalClass
        guardar["INSERT REDEM y UPDATE saldo"]:::statementClass
        commit["COMMIT"]:::statementClass
        rollback["ROLLBACK"]:::rejectClass
        fallo["Error de validación, autorización o dominio"]:::rejectClass
        ok((201 Redención)):::finClass
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

`RedeemPointsUseCase` depende de `ITransactionRepository`; `applyPoints` usa una transacción SQL y bloqueo de fila.

**Fuentes:** [ruta](../../../src/infraestructure/http/routes/v1/transactions.routes.ts), [controlador](../../../src/infraestructure/controllers/v1/transactions.controller.ts), [caso de uso](../../../src/application/use-cases/transactions/redeem-points.usecase.ts), [repositorio transaccional](../../../src/infraestructure/database/repositories/transaction.repository.ts), [repositorio de cuenta](../../../src/infraestructure/database/repositories/account.repository.ts), [esquema](../../../src/infraestructure/schemas/transaction.schema.ts).

## Notas técnicas

### Base de datos

Bloquea y consulta cuenta/saldo, inserta en `loyalty.transactions` y actualiza `loyalty.accounts` en una transacción SQL. La concurrencia y rollback requieren validación adicional con PostgreSQL real.

### Eventos e integraciones

No se observan eventos ni integraciones externas.

## Mapeo y validación

`points` se guarda en la columna `points`; el monto calculado se mapea a `money_amount`. El esquema HTTP valida valores positivos, pero el caso de uso repite la regla `> 0`.

## Ejemplo

```bash
curl -X POST http://localhost:3000/loyalty/v1/transactions/redeem \
  -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
  -d '{"documentType":"CC","documentNumber":"1037630472","partnerCode":"STORE-01","points":20,"reference":"ORDER-124"}'
```
