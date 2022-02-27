import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}

export default RegisterDTO;
