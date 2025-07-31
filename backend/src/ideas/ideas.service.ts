import { Idea } from 'src/entities/idea.entity';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(Idea)
    private ideaRepo: Repository<Idea>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userId: string, createDto: CreateIdeaDto) {
    const creator = await this.userRepo.findOneBy({ id: userId });
    if (!creator) {
      throw new NotFoundException('User not found');
    }
    const existingIdea = await this.ideaRepo.findOneBy({
      creator: creator,
      name: createDto.name,
    });

    if (existingIdea) {
      throw new ConflictException('Idea already exists');
    }

    const idea = this.ideaRepo.create({
      ...createDto,
      creator: creator,
    });

    return this.ideaRepo.save(idea);
  }

  async findAllUserIdeas(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Query by creator id, not user object
    const ideas = await this.ideaRepo.find({
      where: { creator: { id: user.id } },
    });

    return ideas.map((idea) => ({
      id: idea.id,
      name: idea.name,
      description: idea.description,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      creator: {
        id: idea.creator.id,
        username: idea.creator.username,
      },
      //followers: idea.followers,
    }));
  }

  async findAll() {
    const ideas = await this.ideaRepo.find({
      relations: ['followers', 'creator'],
    });

    return ideas.map((idea) => ({
      id: idea.id,
      name: idea.name,
      description: idea.description,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      creator: {
        id: idea.creator.id,
        username: idea.creator.username,
      },
      followers:
        idea.followers.length > 0
          ? idea.followers.map((follower) => {
              return { id: follower.id, username: follower.username };
            })
          : [],
    }));
  }

  async follow(id: string, userId: string) {
    const idea = await this.ideaRepo.findOne({
      where: { id },
      relations: ['followers', 'creator'], // <-- Eagerly load followers and creator
    });
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!idea) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = idea.followers.some(
      (follower) => follower.id === user.id,
    );
    if (!isFollowing) {
      idea.followers.push(user);
      await this.ideaRepo.save(idea);
    }

    return {
      id: idea.id,
      name: idea.name,
      description: idea.description,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      creator: {
        id: idea.creator.id,
        username: idea.creator.username,
      },
    };
  }

  async unfollow(id: string, userId: string) {
    const idea = await this.ideaRepo.findOne({
      where: { id },
      relations: ['followers', 'creator'], // <-- Eagerly load followers and creator
    });
    if (!idea) {
      throw new NotFoundException('User not found');
    }

    idea.followers = idea.followers.filter(
      (follower) => follower.id !== userId,
    );

    await this.ideaRepo.save(idea);
    return idea;
  }
}
