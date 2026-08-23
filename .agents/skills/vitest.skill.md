# Skill: pruebas Vitest

## Caso de uso

```ts
const repository = { findById: vi.fn() } as unknown as IThingRepository;
const useCase = new GetThingUseCase(repository);
repository.findById.mockResolvedValue(entity);

const result = await useCase.execute("id");
expect(result).toEqual(expected);
expect(repository.findById).toHaveBeenCalledWith("id");
```

Cubrir validaciones de negocio, ausencia de recurso, propagación de puertos y mapeo de DTO. Para middleware, probar siguiente paso, respuestas tempranas y que no llame `next()` cuando se rechaza.

Ejecutar `npm run test:run` para CI y `npm run test:coverage` al cambiar lógica cubierta. No deshabilitar pruebas ni bajar umbrales para pasar la suite.
