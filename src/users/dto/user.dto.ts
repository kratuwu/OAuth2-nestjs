import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

@Exclude()
export class UserDTO {
  @Transform(({ value, obj }) => {
    if (obj._id && typeof obj._id.toString === 'function') {
      return obj._id.toString();
    } else {
      return value;
    }
  })
  @Expose()
  id: string;

  @IsEmail()
  @Expose()
  email: string;

  @Expose()
  password: string;

  @Expose()
  resetPasswordToken?: string;

  @Expose()
  resetPasswordExp?: number;
}

export default UserDTO;
