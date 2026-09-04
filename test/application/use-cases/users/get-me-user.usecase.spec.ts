import { describe, expect, it, vi } from "vitest";
import { GetMeUseCase } from "../../../../src/application/use-cases/users/get-me-user.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import { User } from "../../../../src/domain/entities/user.entity";

describe("GetMeUseCase", () => {
  it("returns only public data for an existing user", async () => {
    const userRepository = {
      findByDocument: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "123", "Ada", "ada@example.com", "300", "hash"),
        ),
    } as unknown as IUserRepository;

    await expect(new GetMeUseCase(userRepository).execute("123")).resolves.toEqual({
      documentNumber: "123",
      documentType: "CC",
      fullName: "Ada",
      email: "ada@example.com",
      phone: "300",
    });
    expect(userRepository.findByDocument).toHaveBeenCalledWith("123");
  });

  it("throws USER_NOT_FOUND when the document does not exist", async () => {
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;

    await expect(
      new GetMeUseCase(userRepository).execute("missing"),
    ).rejects.toMatchObject({
      ...DomainErrors.USER_NOT_FOUND,
    } satisfies Partial<DomainException>);
  });
});
