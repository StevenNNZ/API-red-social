import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    //Si no corresponden los datos, lanzamos una excepcion
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas.');
    }

    const { password: _, ...rest } = user.toJSON();

    //Retornamos los datos del usuario y su token. Sin contraseña
    return {
      user: rest,
      token: this.getJWToken({ id: user.id }),
    };
  }

  async register(createUserDto: CreateUserDto): Promise<LoginResponse> {
    try {
      const { password, birthDate, ...userData } = createUserDto;

      //Creamos el usuario y encriptamos la contraseña
      const newUser = new this.userModel({
        password: this.encryptPassword(password),
        birthDate: new Date(birthDate),
        idImageRandom: Math.floor(Math.random() * 70) + 1,
        ...userData,
      });

      await newUser.save();

      const { password: _, ...user } = newUser.toJSON();

      //Retornamos los datos del usuario y su token. Sin contraseña
      return {
        user,
        token: this.getJWToken({ id: user._id }),
      };
    } catch (error) {
      this.handleExceptions(error, createUserDto.email);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(id);

    if (updateUserDto.password) {
      updateUserDto.password = this.encryptPassword(updateUserDto.password);
    }

    const updatedAt = new Date();
    try {
      await user.updateOne({ ...updateUserDto, updatedAt }, { new: true });
      return { ...user.toJSON(), ...updateUserDto, updatedAt };
    } catch (error) {
      this.handleExceptions(error, updateUserDto.email);
    }
  }

  async findUserById(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(`El id no es válido`);

    //Retornamos los datos del usuario por id.
    return await this.userModel.findById(id);
  }

  private handleExceptions(error: any, email: string) {
    if (error.code === 11000)
      throw new BadRequestException(`El correo '${email}' ya existe`);

    throw new InternalServerErrorException(
      'Ha ocurrido un error en el servidor',
    );
  }

  encryptPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }
  //Devolvemos el token según el payload
  getJWToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
