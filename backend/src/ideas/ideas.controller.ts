import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { IdeasService } from './ideas.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('ideas')
export class IdeasController {
  constructor(private ideaService: IdeasService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(
    @Body() createDto: CreateIdeaDto,
    @Req() req: { user: { id: string } },
  ) {
    return await this.ideaService.create(req.user.id, createDto);
  }

  @Get('')
  async findAll() {
    return await this.ideaService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ideaService.follow(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unfollow')
  async unfollow(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ideaService.unfollow(id, req.user.id);
  }
}
