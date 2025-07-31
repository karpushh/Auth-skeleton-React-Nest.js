import { IdeasService } from './../ideas/ideas.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ideasService: IdeasService,
  ) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.findOne(id);
  }

  @Get(':id/ideas')
  async findAllUserIdeas(@Param('id', ParseUUIDPipe) id: string) {
    return await this.ideasService.findAllUserIdeas(id);
  }
}
