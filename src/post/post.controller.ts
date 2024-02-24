import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseMongoIdPipe } from 'src/auth/pipes/parse-mongo-id.pipe';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.postService.findAll();
  }

  @Get('/filter/:term')
  @UseGuards(AuthGuard)
  getPostsByTerm(@Param('term') term: string) {
    return this.postService.getPostsByTerm(term);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.postService.remove(id);
  }

  @Patch('/like/:id')
  @UseGuards(AuthGuard)
  likePost(@Param('id', ParseMongoIdPipe) id: string) {
    return this.postService.likePost(id);
  }
}
