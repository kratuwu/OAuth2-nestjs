import { IsEmail, IsNotEmpty } from 'class-validator';

class ForgotPasswordDTO {
  @IsEmail()
  email: string;
}

export default ForgotPasswordDTO;
