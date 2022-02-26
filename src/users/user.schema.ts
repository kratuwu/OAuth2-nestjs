import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { randomBytes } from 'crypto';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User &
  Document & { generatePasswordReset: () => void };

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  public email!: string;

  @Prop()
  @Exclude()
  public password?: string;

  @Prop()
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Prop()
  @Exclude()
  public resetPasswordToken?: string;

  @Prop()
  @Exclude()
  public resetPasswordExp?: number;
}
const UserSchema = SchemaFactory.createForClass(User);
UserSchema.method({
  generatePasswordReset: function (this: UserDocument) {
    this.resetPasswordToken = randomBytes(20).toString('hex');
    this.resetPasswordExp = Date.now() + 3600000; //expires in an hour
  },
});
UserSchema.pre<UserDocument>('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
UserSchema.index({ email: 1 }, { unique: true });
export default UserSchema;
