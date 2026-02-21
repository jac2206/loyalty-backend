# 🧱 Express TS Chasis

## 🚀 DDD + Arquitectura Hexagonal + Awilix + Vitest + Winston

Backend base profesional construido con:

- Node.js
- Express 5
- TypeScript
- DDD (Domain-Driven Design)
- Arquitectura Hexagonal (Ports & Adapters)
- Awilix (Inyección de dependencias)
- Vitest (Testing + Coverage)
- Winston (Logging estructurado)
- Dotenv (Variables de entorno)
- Middleware global de errores

---

# 🧠 1. Arquitectura

Este proyecto implementa:

- 🔹 DDD (Domain-Driven Design)
- 🔹 Arquitectura Hexagonal (Ports & Adapters)
- 🔹 Clean Architecture
- 🔹 Inversión de Dependencias

---

## 🔷 Arquitectura Hexagonal

El dominio está en el centro y define contratos (interfaces).
La infraestructura implementa esos contratos.

```
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

- Entidades
- Interfaces (Ports)
- Errores de dominio
- Excepciones personalizadas

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
    private readonly age: number
  ) {
    if (age < 0) {
      throw new Error("Age cannot be negative");
    }
  }

  toPersistence() {
    return {
      name: this.name,
      lastName: this.lastName,
      age: this.age
    };
  }
}
```

---

## 🟢 2.2 Domain Errors

```ts
export const DomainErrors = {
  GENERIC_INVALID_NAME: {
    code: "GENERIC_INVALID_NAME",
    message: "Name must have at least 3 characters",
    statusCode: 422
  },
  GENERIC_NOT_FOUND: {
    code: "GENERIC_NOT_FOUND",
    message: "Generic entity not found",
    statusCode: 404
  }
};
```

---

## 🟢 2.3 Domain Exception

```ts
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}
```

---

## 🔵 2.4 Application Layer

Contiene:

- Casos de uso
- DTOs

### Interface

```ts
export interface ICreateGenericUseCase {
  execute(input: GenericRequestDto): Promise<GenericResponseDto>;
}
```

### Use Case con validación

```ts
export class CreateGenericUseCase implements ICreateGenericUseCase {

  async execute(input: GenericRequestDto): Promise<GenericResponseDto> {

    if (!input.name || input.name.trim().length < 3) {
      const error = DomainErrors.GENERIC_INVALID_NAME;
      throw new DomainException(
        error.code,
        error.message,
        error.statusCode
      );
    }

    return {
      name: input.name,
      lastName: input.lastName,
      age: input.age
    };
  }
}
```

---

## 🟣 2.5 Infrastructure

Contiene:

- Controllers
- Routes
- Logger
- Database
- Middlewares
- Implementaciones concretas

---

### Controller

```ts
export class GenericController {

  constructor(
    private readonly createGenericUseCase: ICreateGenericUseCase
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
import { Request, Response, NextFunction } from "express";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { logger } from "../logger/logger";

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof DomainException) {
    logger.warn("Domain error", {
      code: err.code,
      message: err.message
    });

    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message
    });
  }

  logger.error("Unexpected error", err);

  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error"
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
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});
```

---

# 🌎 5. Variables de Entorno

### .env

```
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

### env.ts

```ts
import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  showEnv: process.env.SHOW_ENV === "true"
};
```

---

# 🧩 6. Inyección de Dependencias – Awilix

```bash
npm install awilix awilix-express
```

### container.ts

```ts
import { createContainer, asClass, InjectionMode } from "awilix";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
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

```
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

# 📂 9. Estructura del Proyecto

```
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
├── server.ts
```

---

# 📡 10. Endpoints

```
GET    /api/v1/generic
POST   /api/v1/generic
PATCH  /api/v1/generic/:id
```

---

# 🧠 11. Principios Aplicados

- Separation of Concerns
- Dependency Inversion
- Clean Architecture
- Single Responsibility
- Testabilidad
- Manejo transversal de errores
- Logging estructurado

---

# 🏁 Conclusión

Este chasis permite:

- Escalar a microservicios
- Cambiar base de datos sin tocar dominio
- Implementar eventos
- Probar lógica sin levantar servidor
- Mantener arquitectura limpia profesional

---

> El dominio define el negocio.  
> La aplicación ejecuta acciones.  
> La infraestructura implementa detalles.