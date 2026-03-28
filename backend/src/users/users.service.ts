import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { AlreadyExistsException } from 'src/common/exceptions/app.exception';
import argon2 from 'argon2';

@Injectable()
export class UsersService {

  constructor(private readonly usersRepository: UsersRepository) {}

  // Create a User 
  async create(createUserDto: CreateUserDto) {
    const passwordHash = createUserDto.passwordHash;
    
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new AlreadyExistsException('User already exists', {code: `USER_ALREADY_EXISTS`});
    }

    const hashedPassword = await argon2.hash(passwordHash);
    
    const createdUser = this.usersRepository.create({
      ...createUserDto, 
      passwordHash: hashedPassword
    });

    return createdUser;
  }
}