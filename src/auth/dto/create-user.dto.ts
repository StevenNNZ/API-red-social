import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsDateString()
  birthDate: Date;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
