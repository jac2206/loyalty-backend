# Implementación backend

- TypeScript estricto: no introducir `any`; tipar DTOs, puertos, `Request`/`Response` cuando sea útil y resultados de repositorio.
- Preferir `async/await`, `readonly` para dependencias y retornos explícitos en límites de capa.
- Controladores: extraen request, invocan un solo caso de uso y devuelven la respuesta; sin reglas de negocio.
- DTOs viven en `application/dto`; no reutilizar entidades como respuesta HTTP si puede filtrar datos.
- Entidades: preservar inmutabilidad práctica y exponer `toPersistence()` únicamente para mapeo de infraestructura.
- Base de datos: SQL parametrizado, nombres de esquema explícitos para dominio de lealtad (`loyalty.*`) y mapeo explícito de snake_case a camelCase.
- Configuración: leer variables mediante `src/config/env.ts`; no acceder dispersamente a `process.env`.
- Logging: usar el logger; no loguear tokens, contraseñas, hashes ni `DATABASE_URL`.
