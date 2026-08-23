# Patrones de prueba

## Arrange–Act–Assert

```ts
it("rejects a redemption above balance", async () => {
  // Arrange
  accountRepository.getBalance.mockResolvedValue(10);
  const request = validRequest({ points: 11 });

  // Act / Assert
  await expect(useCase.execute(request)).rejects.toMatchObject({
    code: "INSUFFICIENT_POINTS",
    statusCode: 422
  });
  expect(transactionRepository.save).not.toHaveBeenCalled();
});
```

## Dobles

- Crear mocks pequeños por puerto: `{ findByEmail: vi.fn() }`, no objetos globales con comportamiento oculto.
- Restablecerlos con `beforeEach`.
- Para Express, `res.status = vi.fn().mockReturnValue(res)` y `res.json = vi.fn()`.
- Para PostgreSQL, mockear `pool.query` y comprobar query/params cuando la consulta sea parte importante del contrato.

## Casos fronterizos de lealtad

- Cero, negativos, decimales y montos que otorgan cero puntos.
- Documento sin usuario/cuenta.
- Referencia mínima e inválida.
- Token ausente, inválido y scope insuficiente.
- Fallo de persistencia durante una operación que cambia saldo: prueba la garantía transaccional cuando se implemente.
