# Patrones del backend

## Caso de uso y puerto

Un caso de uso recibe DTOs primitivos, valida reglas de negocio que no sean de formato, usa interfaces del dominio y devuelve DTOs. Debe lanzar `DomainException` con una entrada de `DomainErrors` para errores esperados.

```ts
export class GetThingUseCase implements IGetThingUseCase {
  constructor(private readonly thingRepository: IThingRepository) {}

  async execute(id: string): Promise<GetThingResponseDTO> {
    const entity = await this.thingRepository.findById(id);
    if (!entity) {
      const error = DomainErrors.THING_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    return { id: entity.id };
  }
}
```

## Repositorios

- Usar consultas parametrizadas (`$1`, `$2`), nunca interpolación de input.
- Mapear cada fila explícitamente a una entidad; no filtrar objetos `pg` al dominio.
- Cuando una operación debe modificar saldo e historial como una unidad, usar cliente de PostgreSQL y `BEGIN`/`COMMIT`/`ROLLBACK`; no mezclar operaciones independientes.

## Errores

- Formato inválido: Zod + `validate` → 422 `VALIDATION_ERROR`.
- Regla de negocio o ausencia de recurso: catálogo de dominio + `DomainException`.
- Error inesperado: `errorMiddleware` → 500 sin detalles internos.
- Añadir un error al módulo relevante (`users`, `accounts`, `transactions`) y exportarlo desde `domain-errors.ts`.

## Seguridad

- Aplicar `authenticateJWT` antes de `authorizeScopes`.
- Declarar los scopes requeridos en la spec y reflejarlos en la ruta y Swagger.
- No confiar en identificadores del body para acciones del usuario autenticado si la regla exige identidad propia: comparar con `req.user.sub` o modelar autorización en el caso de uso.

## Composición Awilix

Con `InjectionMode.CLASSIC`, esto debe coincidir:

```ts
constructor(private readonly thingRepository: IThingRepository) {}
// container.register({ thingRepository: asClass(ThingRepository).scoped() })
```

Usar `scoped()` para casos de uso, controladores y repositorios; `singleton()` para servicios sin estado, logger y clientes compartidos.
