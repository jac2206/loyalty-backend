# Spec: autenticación y usuarios

**Estado:** comportamiento actual documentado.  
**Propietario de dominio:** Usuarios.

## Objetivo

Registrar usuarios y emitir JWT para acceder a recursos protegidos.

## Reglas

1. El email debe ser único.
2. La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.
3. La contraseña se almacena como hash bcrypt y nunca se devuelve.
4. Login con email inexistente o contraseña inválida devuelve `USER_INVALID_CREDENTIALS` (401).
5. El JWT de acceso tiene `sub` igual a `documentNumber` y scope `user`.

## Contratos actuales

| Operación | Ruta | Seguridad | Resultado |
| --- | --- | --- | --- |
| Registrar | `POST /loyalty/v1/users/register` | Pública | 201, id/email/fullName/mensaje |
| Login | `POST /loyalty/v1/users/login` | Pública | 200, token |
| Perfil | `GET /loyalty/v1/users/me` | JWT + `user` | 200, datos públicos |
| Listar | `GET /loyalty/v1/users` | JWT + `user` | 200, usuarios públicos |
| Actualizar perfil | `PATCH /loyalty/v1/users/:documentNumber` | JWT + `user`, el documento debe coincidir con `sub` | 200, perfil actualizado |

## Actualizar perfil de usuario

- El body requiere `email` válido y `fullName` de al menos 3 caracteres.
- El usuario se localiza por `documentNumber`; el documento es inmutable.
- Solo se actualizan el correo y el nombre completo del usuario autenticado.
- El correo puede conservar el actual, pero no puede pertenecer a otro usuario.
- Un usuario inexistente devuelve 404 `USER_NOT_FOUND`; un correo usado por otro usuario devuelve 409 `USER_EMAIL_ALREADY_EXISTS`.
- Un documento de ruta distinto del `sub` del JWT devuelve 403 `USER_DOCUMENT_MISMATCH`.

### Aceptación de actualización

- Dado un usuario existente y un correo disponible, se persisten correo y nombre completo y se responde 200 con los datos públicos actualizados.
- Dado el mismo correo actualmente asociado al usuario, la actualización se permite.
- Dado un correo asociado a otro usuario, se responde 409 y no se modifica el usuario.
- Dado un documento inexistente, se responde 404 y no se modifica ningún usuario.
- Dado un documento diferente al del token, se responde 403 sin consultar ni modificar el repositorio.
- El endpoint requiere autenticación JWT y scope `user`.

## Aceptación

- Dado un email nuevo y password válida, al registrar se persiste el hash y se responde 201 sin password.
- Dado un email repetido, se responde 409 `USER_EMAIL_ALREADY_EXISTS`.
- Dadas credenciales válidas, al login se emite un JWT verificable con scope `user`.
- Dado un token inválido o ausente, los endpoints protegidos responden 401.
