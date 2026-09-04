import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { RegisterUserUseCase } from "../../../../src/application/use-cases/users/register-user.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import { User } from "../../../../src/domain/entities/user.entity";

describe("RegisterUserUseCase", () => {
  const request = {
    documentType: "CC" as const,
    documentNumber: "123",
    fullName: "Ada",
    email: "ada@example.com",
    password: "Secure123",
    phone: "300",
  };

  it("hashes and persists a new user, returning the public registration response", async () => {
    const userRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation(async (user: User) => user),
    } as unknown as IUserRepository;

    await expect(
      new RegisterUserUseCase(userRepository).execute(request),
    ).resolves.toEqual({
      id: "123",
      email: "ada@example.com",
      fullName: "Ada",
      message: "User registered successfully",
    });
    const savedUser = vi.mocked(userRepository.save).mock.calls[0][0];
    expect(await bcrypt.compare("Secure123", savedUser.passwordHash)).toBe(true);
    expect(savedUser.phone).toBe("300");
  });

  it("rejects a weak password without querying or persisting", async () => {
    const userRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    } as unknown as IUserRepository;

    await expect(
      new RegisterUserUseCase(userRepository).execute({ ...request, password: "weak" }),
    ).rejects.toMatchObject(DomainErrors.USER_WEAK_PASSWORD);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email without persisting", async () => {
    const userRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(new User("CC", "999", "Other", request.email, null, "hash")),
      save: vi.fn(),
    } as unknown as IUserRepository;

    await expect(
      new RegisterUserUseCase(userRepository).execute(request),
    ).rejects.toMatchObject(DomainErrors.USER_EMAIL_ALREADY_EXISTS);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
