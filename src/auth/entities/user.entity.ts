import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Post } from 'src/post/entities/post.entity';

@Schema()
export class User {
  _id?: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Post.name }] })
  posts: Types.Array<Post>;

  @Prop({ required: true })
  idImageRandom: number;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
