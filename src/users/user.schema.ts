import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Type } from 'class-transformer';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

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
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
