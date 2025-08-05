import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

/**
 * Service for user management: create, update, find, and query users.
 */
@Injectable()
export class UsersService {
  /**
   * Constructor for UsersService.
   * @param userRepo - TypeORM repository for User entity.
   */
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Updates user attributes for a given user ID.
   * @param id - The user's ID.
   * @param attrs - Partial user attributes to update.
   * @returns The updated user entity.
   * @throws Error if user not found.
   */
  async update(id: string, attrs: Partial<User>) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    const updatedUser = await this.userRepo.save(user);
    return {
      username: updatedUser.username,
      email: updatedUser.email,
      id: updatedUser.id,
    };
  }

  /**
   * Finds all users in the database.
   * @returns Array of user entities.
   */
  async findAll() {
    return await this.userRepo.find({
      select: {
        username: true,
        email: true,
        id: true,
      },
    });
  }

  /**
   * Finds a user by ID.
   * @param id - The user's ID.
   * @returns The user entity (including password).
   * @throws NotFoundException if user not found.
   */
  async findOne(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { username: user.username, email: user.email, id: user.id };
  }

  /**
   * Finds a user by email address.
   * @param email - The user's email address.
   * @returns The user entity or null if not found.
   */
  async findOneByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { username: user.username, email: user.email, id: user.id };
  }
}
