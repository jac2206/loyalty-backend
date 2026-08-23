import { describe, expect, it, vi } from 'vitest';
import { GetAllUsersUseCase } from '../../../../src/application/use-cases/users/get-all-users.usecase';
import { IUserRepository } from '../../../../src/domain/interfaces/repositories/user.repository.interface';
import { User } from '../../../../src/domain/entities/user.entity';

describe('GetAllUsersUseCase', () => {
  it('maps public user data returned by the repository', async () => {
    const users = [
      new User(
        'CC',
        '123',
        'Ada Lovelace',
        'ada@example.com',
        null,
        'secret',
        true,
        true,
      ),
    ];
    const userRepository = {
      findAll: vi.fn().mockResolvedValue(users),
    } as unknown as IUserRepository;
    const useCase = new GetAllUsersUseCase(userRepository);

    const result = await useCase.execute();

    expect(result).toEqual([
      {
        documentType: 'CC',
        documentNumber: '123',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: null,
        hasPin: true,
        status: true,
      },
    ]);
    expect(userRepository.findAll).toHaveBeenCalledOnce();
  });
});
