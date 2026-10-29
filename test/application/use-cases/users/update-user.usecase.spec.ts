import { describe, expect, it, vi } from "vitest";
import { UpdateUserUseCase } from "../../../../src/application/use-cases/users/update-user.usecase";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { User } from "../../../../src/domain/entities/user.entity";
import { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";

describe("UpdateUserUseCase", () => {
  const documentNumber = "123456789";
  const request = {
    email: "ada.new@example.com",
    fullName: "Ada Lovelace",
  };
  const user = new User(
    "CC",
    documentNumber,
    "Ada",
    "ada@example.com",
    null,
    "password-hash",
  );

  it("updates the authenticated user's email and full name", async () => {
    const updatedUser = new User(
      "CC",
      documentNumber,
      request.fullName,
      request.email,
      null,
      "password-hash",
    );
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(user),
      findByEmail: vi.fn().mockResolvedValue(null),
      updateProfile: vi.fn().mockResolvedValue(updatedUser),
    } as unknown as IUserRepository;

    const result = await new UpdateUserUseCase(userRepository).execute(
      documentNumber,
      documentNumber,
      request,
    );

    expect(result).toEqual({
      documentNumber,
      documentType: "CC",
      fullName: request.fullName,
      email: request.email,
      phone: null,
    });
    expect(userRepository.updateProfile).toHaveBeenCalledWith(
      documentNumber,
      request.email,
      request.fullName,
    );
  });

  it("allows the user to keep their current email", async () => {
    const unchangedEmailRequest = { ...request, email: user.email };
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(user),
      findByEmail: vi.fn().mockResolvedValue(user),
      updateProfile: vi
        .fn()
        .mockResolvedValue(
          new User("CC", documentNumber, request.fullName, user.email, null, "hash"),
        ),
    } as unknown as IUserRepository;

    await expect(
      new UpdateUserUseCase(userRepository).execute(
        documentNumber,
        documentNumber,
        unchangedEmailRequest,
      ),
    ).resolves.toMatchObject({ email: user.email, fullName: request.fullName });
    expect(userRepository.updateProfile).toHaveBeenCalledOnce();
  });

  it("rejects an email owned by another user without updating", async () => {
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(user),
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "987654321", "Other User", request.email, null, "hash"),
        ),
      updateProfile: vi.fn(),
    } as unknown as IUserRepository;

    await expect(
      new UpdateUserUseCase(userRepository).execute(
        documentNumber,
        documentNumber,
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.USER_EMAIL_ALREADY_EXISTS);
    expect(userRepository.updateProfile).not.toHaveBeenCalled();
  });

  it("rejects a document that does not belong to the authenticated user", async () => {
    const userRepository = {
      findByDocument: vi.fn(),
      findByEmail: vi.fn(),
      updateProfile: vi.fn(),
    } as unknown as IUserRepository;

    await expect(
      new UpdateUserUseCase(userRepository).execute(
        documentNumber,
        "other-document",
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.USER_DOCUMENT_MISMATCH);
    expect(userRepository.findByDocument).not.toHaveBeenCalled();
    expect(userRepository.updateProfile).not.toHaveBeenCalled();
  });

  it("rejects a document that does not exist", async () => {
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn(),
      updateProfile: vi.fn(),
    } as unknown as IUserRepository;

    await expect(
      new UpdateUserUseCase(userRepository).execute(
        documentNumber,
        documentNumber,
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.USER_NOT_FOUND);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.updateProfile).not.toHaveBeenCalled();
  });

  it("reports a user that disappears before the update", async () => {
    const userRepository = {
      findByDocument: vi.fn().mockResolvedValue(user),
      findByEmail: vi.fn().mockResolvedValue(null),
      updateProfile: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;

    await expect(
      new UpdateUserUseCase(userRepository).execute(
        documentNumber,
        documentNumber,
        request,
      ),
    ).rejects.toMatchObject(DomainErrors.USER_NOT_FOUND);
  });
});
