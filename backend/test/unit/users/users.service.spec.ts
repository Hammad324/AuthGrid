import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { AlreadyExistsException, NotFoundException, ForbiddenException, ConflictException } from '../../../src/common/exceptions/app.exception';
import argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
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

  // create user

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

  // get user profile 

  describe('getProfile', () => {

    it('should successfully return a logged in users own profile', async () => {
      const mockUserFromDb = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'secret_hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isBanned: false
      };
      mockUsersRepository.findById.mockResolvedValue(mockUserFromDb);
      const result = await service.getProfile('1');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('1');

      // should not have these private properites
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('isDeleted');

      // should have these public properites
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      
    });

    it('should throw a NotFound exception if the user does not exist', async () => {
      const userId = "not-existing-user-id";
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(NotFoundException);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(userId);
      
    });

    it('should throw a NotFoundException if the user is deleted', async () => {
      const mockUserFromDb = {
        id: '1',
        isDeleted: true
      };
      mockUsersRepository.findById.mockResolvedValue(mockUserFromDb);
      await expect(service.getProfile('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw a ForbiddenException if the user is banned', async () => {
      const mockUserFromDb = {
        id: '1',
        isDeleted: false,
        isBanned: true
      };
      mockUsersRepository.findById.mockResolvedValue(mockUserFromDb);
      await expect(service.getProfile('1')).rejects.toThrow(ForbiddenException);
    });
  });

  // update user email and name

  describe('update', () => {

    it('should successfully update a user', async () => {

      const existingUser = {
        id: '2',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isBanned: false
      };

      const updateData = {
        email: 'new-email@example.com',
        name: 'New Name',
      };
      
      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.update.mockResolvedValue(updatedUser);
      const result = await service.update(existingUser.id, updateData);
      
      expect(mockUsersRepository.update).toHaveBeenCalledWith(existingUser.id, updateData);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('createdAt');
      // expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      const userId = 'non-existing-user-id';
      const updateData = {
        email: 'new-email@example.com',
        name: 'New Name',
      };
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.update(userId, updateData)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if the user is deleted', async () => {
      const userId = '1';
      const updateData = { name: 'New Name' };
      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: true });
      await expect(service.update(userId, updateData)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user is banned', async () => {
      const userId = '1';
      const updateData = { name: 'New Name' };
      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, isBanned: true });
      await expect(service.update(userId, updateData)).rejects.toThrow(ForbiddenException);
    });
  });

  // soft delete user
  describe('softDelete', () => {
    it('should successfully soft delete a user', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'secret_hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const deletedDate = new Date();
      const deletedUser = {
        ...existingUser,
        isDeleted: true,
        deletedAt: deletedDate
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.softDelete.mockResolvedValue(deletedUser);
      
      const result = await service.softDelete('1');
      
      expect(mockUsersRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUsersRepository.softDelete).toHaveBeenCalledWith('1');
      
      // should not have these properties
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('createdAt');
      // should have these properties
      expect(result.id).toEqual(deletedUser.id);
      expect(result.isDeleted).toBe(true);
      expect((result as any).deletedAt).toEqual(deletedDate);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      const userId = 'non-existing-user-id';
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.softDelete(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('banUser', () => {
    it('should successfully ban a user', async () => {
      const existingUser = { id: '1', name: 'Test User', isDeleted: false, isBanned: false };
      const bannedUser = { ...existingUser, isBanned: true };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.banUser.mockResolvedValue(bannedUser);

      const result = await service.banUser('1');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUsersRepository.banUser).toHaveBeenCalledWith('1');
      expect(result).toEqual('Test User, user has been disabled/banned please contact your tenant admin.');
    });

    it('should throw NotFoundException if user does not exist or is deleted', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.banUser('1')).rejects.toThrow(NotFoundException);

      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: true });
      await expect(service.banUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is already banned', async () => {
      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, isBanned: true });
      await expect(service.banUser('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('unban', () => {
    it('should successfully unban a user', async () => {
      const existingUser = { id: '1', name: 'Test User', isDeleted: false, isBanned: true };
      const unbannedUser = { ...existingUser, isBanned: false };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.unbanUser.mockResolvedValue(unbannedUser);

      const result = await service.unban('1');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUsersRepository.unbanUser).toHaveBeenCalledWith('1');
      expect(result).toEqual('Test User has been unbanned');
    });

    it('should throw NotFoundException if user does not exist or is deleted', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.unban('1')).rejects.toThrow(NotFoundException);

      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: true });
      await expect(service.unban('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is not banned', async () => {
      mockUsersRepository.findById.mockResolvedValue({ id: '1', isDeleted: false, isBanned: false });
      await expect(service.unban('1')).rejects.toThrow(ConflictException);
    });
  });
});
