import { IsNotEmpty } from 'class-validator';

class ResetPasswordDTO {
  @IsNotEmpty()
  password: string;
}

export default ResetPasswordDTO;
