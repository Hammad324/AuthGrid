import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('PrismaService Integration Test', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Should connect with the test database', async () => {
    const result = await prisma.$queryRawUnsafe('SELECT 1');
    expect(result).toBeDefined();
  });
});
