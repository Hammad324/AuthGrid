import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { AlreadyExistsException } from '../../../src/common/exceptions/app.exception';
import argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'password123',
    };

    it('should successfully create a user', async () => {
      const hashedPassword = 'hashed_password';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      
      const createdUser = {
        id: '1',
        ...createUserDto,
        passwordHash: hashedPassword,
      };
      mockUsersRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(argon2.hash).toHaveBeenCalledWith(createUserDto.passwordHash);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        passwordHash: hashedPassword,
      });
    });

    it('should throw AlreadyExistsException if email is already taken', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(service.create(createUserDto)).rejects.toThrow(AlreadyExistsException);
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });
});
