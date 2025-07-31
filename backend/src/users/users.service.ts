import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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
   * Creates a new user with hashed password.
   * @param createUserDto - Data transfer object for creating a user.
   * @returns The created user entity.
   * @throws ConflictException if user already exists.
   */
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepo.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepo.save(newUser);
  }

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
      throw new Error('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  /**
   * Finds all users in the database.
   * @returns Array of user entities.
   */
  async findAll() {
    return await this.userRepo.find();
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
    return { ...user }; // RETURNS THE PASSWORD
  }

  /**
   * Finds a user by email address.
   * @param email - The user's email address.
   * @returns The user entity or null if not found.
   */
  async findOneByEmail(email: string) {
    return await this.userRepo.findOneBy({ email });
  }
}
