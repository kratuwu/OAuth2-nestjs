import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

@Exclude()
export class ProfileDTO {
  @IsEmail()
  @Expose()
  email: string;
}

export default ProfileDTO;
