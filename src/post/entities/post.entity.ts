import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Post {
  _id?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, maxlength: 280 })
  content: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
