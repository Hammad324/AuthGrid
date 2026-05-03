import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { AlreadyExistsException, ConflictException, ForbiddenException, NotFoundException } from 'src/common/exceptions/app.exception';
import argon2 from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';

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
    
    const createdUser = await this.usersRepository.create({
      ...createUserDto, 
      passwordHash: hashedPassword
    });

    return createdUser;
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`});
    }

    if (user.isBanned) {
      throw new ForbiddenException('User is banned', {code: `USER_BANNED`});
    }

    const {passwordHash, createdAt, updatedAt, isDeleted, ...safeUser} = user; // remove passwordHash from response
    return safeUser;
  }


  // Update user
  // this service only updates name and email
  async update(id: string, data: UpdateUserDto) {

    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser || existingUser.isDeleted) {
      throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`});
    }

    if (existingUser.isBanned) {
      throw new ForbiddenException('User is banned', {code: `USER_BANNED`});
    }

    // check if user is updating their email it should be unique
    if (data.email) {
      const existingUserByEmail = await this.usersRepository.findByEmail(data.email);
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new AlreadyExistsException('Email already exists', {code: `EMAIL_ALREADY_EXISTS`});
      }
    }

    const updatedUser = await this.usersRepository.update(id, data);
    const {passwordHash, createdAt, ...safeUser} = updatedUser; // remove passwordHash from response
    return safeUser;
  }

  // softDelete user

  async softDelete(id: string) {

    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`});
    }

    const deletedUser = await this.usersRepository.softDelete(id);
    const {passwordHash, createdAt, ...safeUser} = deletedUser; // remove passwordHash from response
    return safeUser;
  }

  // both of these are to be accessed by tenant owners or admins
  // ban user
  async banUser(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`});
    }

    if (user.isBanned) {
      throw new ConflictException('User is already banned', {code: `CONFLICT`});
    }

    const bannedUser = await this.usersRepository.banUser(id);
    const result = `${bannedUser.name}, user has been disabled/banned please contact your tenant admin.`;

    return result;
  } 
  
  // unban user
  async unban(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found', {code: `USER_NOT_FOUND`});
    }

    if (!user.isBanned) {
      throw new ConflictException('User is not banned', {code: `CONFLICT`});
    }

    const unbanUser = await this.usersRepository.unbanUser(id);

    const result = `${user.name} has been unbanned`;
    return result;
  }
  
}