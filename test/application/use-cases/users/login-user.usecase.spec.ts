import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { LoginUserUseCase } from "../../../../src/application/use-cases/users/login-user.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";
import { User } from "../../../../src/domain/entities/user.entity";

describe("LoginUserUseCase", () => {
  it("generates an access token with the user scope for valid credentials", async () => {
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(new User("CC", "123", "Ada", "ada@example.com", null, await bcrypt.hash("Secure123", 4))) } as unknown as IUserRepository;
    const authService = { generateToken: vi.fn().mockReturnValue("token") } as unknown as IAuthService;

    await expect(new LoginUserUseCase(userRepository, authService).execute({ email: "ada@example.com", password: "Secure123" })).resolves.toEqual({ token: "token" });
    expect(authService.generateToken).toHaveBeenCalledWith({ sub: "123", email: "ada@example.com", type: "access", scopes: ["user"] });
  });

  it("rejects an unknown email without generating a token", async () => {
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(null) } as unknown as IUserRepository;
    const authService = { generateToken: vi.fn() } as unknown as IAuthService;

    await expect(new LoginUserUseCase(userRepository, authService).execute({ email: "missing@example.com", password: "Secure123" })).rejects.toMatchObject(DomainErrors.USER_INVALID_CREDENTIALS);
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it("rejects an invalid password without generating a token", async () => {
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(new User("CC", "123", "Ada", "ada@example.com", null, await bcrypt.hash("Secure123", 4))) } as unknown as IUserRepository;
    const authService = { generateToken: vi.fn() } as unknown as IAuthService;

    await expect(new LoginUserUseCase(userRepository, authService).execute({ email: "ada@example.com", password: "Wrong123" })).rejects.toMatchObject(DomainErrors.USER_INVALID_CREDENTIALS);
    expect(authService.generateToken).not.toHaveBeenCalled();
  });
});
