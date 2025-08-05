import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'User name is required' })
  @IsString({ message: 'User name must be a string' })
  @MinLength(3, { message: 'User name must be at least 3 characters long' })
  username: string;

  /*   @Matches(/^(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  }) */
  @IsString({ message: 'password must be a string' })
  @MaxLength(25, {
    message: 'password must be shorter than 25 characters long',
  })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
