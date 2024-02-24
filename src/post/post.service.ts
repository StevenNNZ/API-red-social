import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private authService: AuthService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const user = await this.authService.findUserById(createPostDto.userId);

    if (!user) throw new BadRequestException('El id del usuario no existe');

    const post = new this.postModel(createPostDto);
    await post.save();

    return post.populate('userId', ['fullName', 'idImageRandom']);
  }

  findAll() {
    return this.postModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('userId', ['fullName', 'idImageRandom']);
  }

  findOne(id: string) {
    return this.postModel.findById(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (updatePostDto.userId) delete updatePostDto.userId;

    const updatedAt = new Date();
    try {
      await post.updateOne({ ...updatePostDto, updatedAt }, { new: true });
      return { ...post.toJSON(), ...updatePostDto, updatedAt };
    } catch (error) {
      throw new InternalServerErrorException(
        'Ha ocurrido en error',
        error.message,
      );
    }
  }

  async getPostsByTerm(term: string) {
    if (!term) return this.findAll();

    const query = {
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { content: { $regex: term, $options: 'i' } },
          ],
        },
      ],
    };

    const count = await this.postModel.countDocuments(query);

    // Si no se encuentra ningún documento, devolver un arreglo vacío
    if (count === 0) {
      return [];
    }

    return this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('userId', ['fullName', 'idImageRandom']);

    // Verificar si no hay resultados y devolver un arreglo vacío
  }

  async likePost(id: string) {
    const post = await this.findOne(id);

    const postLikes = post.likes + 1;
    post.likes = postLikes;
    return (await post.save()).populate('userId', [
      'fullName',
      'idImageRandom',
    ]);
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    post.isActive = false;
    post.save();
  }
}
