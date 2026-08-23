# Skill: implementar una capacidad Express + TypeScript

1. Localiza o crea la spec del módulo.
2. Crea/actualiza interfaces del dominio, errores y entidad si el concepto lo requiere.
3. Define DTOs y caso de uso inyectando puertos por constructor.
4. Implementa repositorio/adaptador concreto con mapeo explícito.
5. Registra cada dependencia en `src/config/container.ts` con la misma clave que su parámetro constructor.
6. Implementa controller fino, schema Zod y ruta con `registerRoute`.
7. Escribe pruebas por capa y ejecuta build/test.

Checklist: sin Express/pg en domain/application; SQL parametrizado; DTO no expone secretos; error de dominio estable; documentación OpenAPI actualizada.
