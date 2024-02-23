import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

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
        password: bcrypt.hashSync(password, 10),
        birthDate: new Date(birthDate),
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
      if (error.code === 11000)
        throw new BadRequestException(
          `El correo '${createUserDto.email}' ya existe`,
        );

      throw new InternalServerErrorException(
        'Ha ocurrido un error en el servidor',
      );
    }
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);

    //Retornamos los datos del usuario por id. Sin contraseña
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  //Devolvemos el token según el payload
  getJWToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
