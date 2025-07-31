import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsNotEmpty({ message: 'User name is required' })
  @IsString({ message: 'User name must be a string' })
  @MinLength(3, { message: 'User name must be at least 3 characters long' })
  username: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password must be at least 2 characters long' })
  @MaxLength(25, {
    message: 'password must be shorter than 25 characters long',
  })
  password: string;
}
