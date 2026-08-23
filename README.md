# 🧱 Express TS Chasis

## 🚀 DDD + Arquitectura Hexagonal + Awilix + Vitest + Biome + Husky + Commitlint + Winston

Backend base profesional construido con:

* Node.js
* Express 5
* TypeScript
* DDD (Domain-Driven Design)
* Arquitectura Hexagonal (Ports & Adapters)
* Awilix (Inyección de dependencias)
* Vitest (Testing + Coverage)
* Biome (Formatting + Linting)
* Husky (Git Hooks)
* Commitlint (Conventional Commits)
* Winston (Logging estructurado)
* Dotenv (Variables de entorno)
* Middleware global de errores

---

# 🧠 1. Arquitectura

Este proyecto implementa:

* 🔹 DDD (Domain-Driven Design)
* 🔹 Arquitectura Hexagonal (Ports & Adapters)
* 🔹 Clean Architecture
* 🔹 Inversión de Dependencias

---

## 🔷 Arquitectura Hexagonal

El dominio está en el centro y define contratos (interfaces).

La infraestructura implementa esos contratos.

```text
        HTTP (Express)
              ↓
         Controller
              ↓
          Use Case
              ↓
           Domain
              ↑
   Repository / Service / Adapter
```

### 📌 Regla Principal

> Las dependencias siempre apuntan hacia el dominio.

---

# 🧱 2. Capas del Proyecto

---

## 🟢 2.1 Domain (Centro del sistema)

Contiene:

* Entidades
* Interfaces (Ports)
* Errores de dominio
* Excepciones personalizadas

❌ No conoce Express
❌ No conoce base de datos
❌ No conoce frameworks

---

### Ejemplo de Entity

```ts
export class Generic {
  constructor(
    private readonly name: string,
    private readonly lastName: string,
    private readonly age: number,
  ) {
    if (age < 0) {
      throw new Error('Age cannot be negative');
    }
  }

  toPersistence() {
    return {
      name: this.name,
      lastName: this.lastName,
      age: this.age,
    };
  }
}
```

---

## 🟢 2.2 Domain Errors

```ts
export const DomainErrors = {
  GENERIC_INVALID_NAME: {
    code: 'GENERIC_INVALID_NAME',
    message: 'Name must have at least 3 characters',
    statusCode: 422,
  },

  GENERIC_NOT_FOUND: {
    code: 'GENERIC_NOT_FOUND',
    message: 'Generic entity not found',
    statusCode: 404,
  },
};
```

---

## 🟢 2.3 Domain Exception

```ts
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}
```

---

## 🔵 2.4 Application Layer

Contiene:

* Casos de uso
* DTOs

### Interface

```ts
export interface ICreateGenericUseCase {
  execute(input: GenericRequestDto): Promise<GenericResponseDto>;
}
```

### Use Case con validación

```ts
export class CreateGenericUseCase implements ICreateGenericUseCase {
  async execute(
    input: GenericRequestDto,
  ): Promise<GenericResponseDto> {
    if (!input.name || input.name.trim().length < 3) {
      const error = DomainErrors.GENERIC_INVALID_NAME;

      throw new DomainException(
        error.code,
        error.message,
        error.statusCode,
      );
    }

    return {
      name: input.name,
      lastName: input.lastName,
      age: input.age,
    };
  }
}
```

---

## 🟣 2.5 Infrastructure

Contiene:

* Controllers
* Routes
* Logger
* Database
* Middlewares
* Implementaciones concretas

---

### Controller

```ts
export class GenericController {
  constructor(
    private readonly createGenericUseCase: ICreateGenericUseCase,
  ) {}

  postGeneric = async (req: Request, res: Response) => {
    const result = await this.createGenericUseCase.execute(req.body);

    res.status(201).json(result);
  };
}
```

---

# ⚙️ 3. Middleware Global de Errores

```ts
import { Request, Response, NextFunction } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { logger } from '../logger/logger';

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof DomainException) {
    logger.warn('Domain error', {
      code: err.code,
      message: err.message,
    });

    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
  }

  logger.error('Unexpected error', err);

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
}
```

Registrar en `server.ts`:

```ts
app.use(errorMiddleware);
```

---

# 🪵 4. Logger con Winston

```ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),

  transports: [
    new winston.transports.Console(),
  ],
});
```

---

# 🌎 5. Variables de Entorno

### `.env`

```env
PORT=3001
NODE_ENV=local
SHOW_ENV=true

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=generic_db

LOG_LEVEL=info
```

---

### `env.ts`

```ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  showEnv: process.env.SHOW_ENV === 'true',
};
```

---

# 🧩 6. Inyección de Dependencias – Awilix

```bash
npm install awilix awilix-express
```

### `container.ts`

```ts
import { createContainer, asClass, InjectionMode } from 'awilix';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});
```

---

# 🚀 7. Instalación y Ejecución

## Clonar repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git

cd tu-repo
```

## Instalar dependencias

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Servidor en:

```text
http://localhost:3001
```

---

## Compilar proyecto

```bash
npm run build
```

---

## Ejecutar versión compilada

```bash
npm start
```

---

# 🧪 8. Testing con Vitest

```bash
npm install -D vitest @vitest/coverage-v8 supertest
```

### Ejecutar pruebas

```bash
npm run test
```

### Coverage

```bash
npm run test:coverage
```

---

# 🎨 9. Formateo y calidad de código con Biome

Este proyecto utiliza **Biome** para centralizar:

* Formateo del código.
* Linting.
* Organización de imports.
* Reglas recomendadas para JavaScript y TypeScript.

Biome reemplaza la necesidad de utilizar Prettier + ESLint para estas tareas.

---

## 📦 Instalación

```bash
npm install -D @biomejs/biome
```

Inicializar Biome:

```bash
npx @biomejs/biome init
```

Esto genera:

```text
biome.json
```

---

## ⚙️ Configuración

El proyecto utiliza:

* 2 espacios de indentación.
* Comillas simples.
* Punto y coma.
* Trailing commas.
* Ancho de línea de 88 caracteres.
* Saltos de línea consistentes.
* Imports organizados automáticamente.
* Linter con reglas recomendadas.
* Finales de línea `LF`.

La configuración se encuentra en:

```text
biome.json
```

---

## 🧹 Formatear código

Para formatear el proyecto:

```bash
npm run format
```

Script:

```json
{
  "format": "biome format --write ."
}
```

Biome modificará automáticamente los archivos necesarios.

---

## 🔍 Validar código

Para ejecutar formato + linting sin modificar archivos:

```bash
npm run check
```

Script:

```json
{
  "check": "biome check ."
}
```

---

# 🪝 10. Git Hooks con Husky

El proyecto utiliza **Husky** para ejecutar validaciones automáticamente antes de crear commits.

---

## 📦 Instalación

```bash
npm install -D husky

npx husky init
```

El proyecto debe contener:

```text
.husky/
├── pre-commit
└── commit-msg
```

---

## 🔍 Pre-commit

Archivo:

```text
.husky/pre-commit
```

Contenido:

```sh
#!/usr/bin/env sh

npm run format
```

### ¿Qué hace?

Cada vez que se ejecuta:

```bash
git commit
```

Husky:

1. Formatea el código utilizando Biome.
2. Ejecuta las validaciones de Biome.
3. Si existe un error de linting, el commit se detiene.

Flujo:

```text
git commit
    ↓
pre-commit
    ↓
npm run format
    ↓
npm run check
    ↓
Biome
    ↓
✅ Continúa el commit
❌ Se detiene si existen errores
```

Los tests no se ejecutan en cada commit. Se recomienda ejecutarlos mediante CI/CD o antes de crear un Pull Request.

---

# 📝 11. Conventional Commits con Commitlint

El proyecto utiliza **Commitlint** para garantizar que los mensajes de commit sigan Conventional Commits.

---

## 📦 Instalación

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

---

## ⚙️ Configuración

Archivo:

```text
.commitlintrc.json
```

Contenido:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

---

## 🪝 Commit-msg

Archivo:

```text
.husky/commit-msg
```

Contenido:

```sh
#!/usr/bin/env sh

npx --no -- commitlint --edit "$1"
```

Este hook valida el mensaje del commit antes de permitir que se cree.

---

## ✅ Commits válidos

```bash
git commit -m "feat: add user module"

git commit -m "fix: resolve user validation"

git commit -m "refactor: improve repository"

git commit -m "test: add user use case tests"

git commit -m "docs: update project documentation"

git commit -m "chore: update dependencies"
```

---

## ❌ Commits inválidos

```bash
git commit -m "crear usuario"

git commit -m "feat add user"

git commit -m "feat : add user"
```

El formato correcto es:

```text
type: description
```

Por ejemplo:

```text
feat: add user module
```

No debe existir un espacio antes de `:`.

---

# 🔄 12. Flujo completo de Git

Cuando se realiza un commit:

```text
git commit
      ↓
┌─────────────────┐
│    pre-commit   │
└────────┬────────┘
         ↓
 npm run format
         ↓
  npm run check
         ↓
       Biome
         ↓
┌─────────────────┐
│    commit-msg   │
└────────┬────────┘
         ↓
     Commitlint
         ↓
Conventional Commit
         ↓
       ✅ Commit
```

Si alguna validación falla, el commit no se crea.

---

# 📂 13. Estructura del Proyecto

```text
src
├── application
├── domain
│   ├── entities
│   ├── interfaces
│   ├── errors
│   └── exceptions
├── infraestructure
│   ├── controllers
│   ├── http
│   ├── logger
│   ├── middlewares
│   └── database
├── config
│   └── container.ts
├── main.ts
└── server.ts
```

Archivos de configuración principales:

```text
├── AGENTS.md
├── biome.json
├── commitlint.config.json
├── vitest.config.ts
├── jsconfig.json
├── package.json
└── .husky
    ├── pre-commit
    └── commit-msg
```

---

# 📡 14. Endpoints

```text
GET     /api/v1/generic

POST    /api/v1/generic

PATCH   /api/v1/generic/:id
```

---

# 🧠 15. Principios Aplicados

* Separation of Concerns
* Dependency Inversion
* Clean Architecture
* Single Responsibility
* Testabilidad
* Manejo transversal de errores
* Logging estructurado
* Formateo y linting automatizado
* Conventional Commits
* Validaciones automáticas mediante Git Hooks

---

# 🏁 Conclusión

Este chasis permite:

* Escalar a microservicios.
* Cambiar base de datos sin tocar dominio.
* Implementar eventos.
* Probar lógica sin levantar servidor.
* Mantener arquitectura limpia profesional.
* Mantener un estándar de código consistente.
* Automatizar formato y linting.
* Garantizar mensajes de commit consistentes.

---

> El dominio define el negocio.
> La aplicación ejecuta acciones.
> La infraestructura implementa detalles.
> Biome mantiene la calidad y consistencia del código.
> Husky automatiza las validaciones.
> Commitlint garantiza Conventional Commits.

```json
{
  "sub": "user-12345",
  "username": "julian.arango",
  "client_id": "asdasdasdas",
  "type": "access",
  "scopes": [
    "generic",
    "company"
  ],
  "iss": "auth-service",
  "aud": "express-ts-chasis"
}
```
