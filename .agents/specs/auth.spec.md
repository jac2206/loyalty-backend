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

## Aceptación

- Dado un email nuevo y password válida, al registrar se persiste el hash y se responde 201 sin password.
- Dado un email repetido, se responde 409 `USER_EMAIL_ALREADY_EXISTS`.
- Dadas credenciales válidas, al login se emite un JWT verificable con scope `user`.
- Dado un token inválido o ausente, los endpoints protegidos responden 401.
