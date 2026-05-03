import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../src/users/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    getProfile: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create and return the result', async () => {
      const dto: CreateUserDto = { email: 'test@test.com', name: 'Test', passwordHash: 'pwd' };
      const expectedResult = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getHello (getProfile)', () => {
    it('should call usersService.getProfile with req.user.id', async () => {
      const req = { user: { id: '1' } };
      const expectedResult = { id: '1', name: 'Test' };
      mockUsersService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getHello(req);

      expect(service.getProfile).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call usersService.update with req.user.id and dto', async () => {
      const req = { user: { id: '1' } };
      const dto: UpdateUserDto = { name: 'Updated' };
      const expectedResult = { id: '1', name: 'Updated' };
      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(req, dto);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should call usersService.softDelete with req.user.id', async () => {
      const req = { user: { id: '1' } };
      const expectedResult = { id: '1', isDeleted: true };
      mockUsersService.softDelete.mockResolvedValue(expectedResult);

      const result = await controller.delete(req);

      expect(service.softDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });
});
