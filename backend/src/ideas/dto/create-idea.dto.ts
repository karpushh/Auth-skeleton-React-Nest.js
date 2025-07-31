import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateIdeaDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Idea must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(40, { message: 'Name must be shorter than 40 characters' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(3, { message: 'Description must be at least 3 characters long' })
  description: string;
}
