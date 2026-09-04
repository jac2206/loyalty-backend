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
