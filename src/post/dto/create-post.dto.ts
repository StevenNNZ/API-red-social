import { IsMongoId, IsString } from 'class-validator';

export class CreatePostDto {
  @IsMongoId()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;
}
