import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly jwtService: JwtService
    ) { } 

        async register(registerDto: RegisterDto) {
            const user = await this.usuarioService.findOneByEmail(registerDto.email);
            if (user) {
                throw new BadRequestException('User already exists');
            }
            
            return await this.usuarioService.create(registerDto);
        }    

        async login(loginDto: LoginDto) {
            const user = await this.usuarioService.findOneByEmail(loginDto.email);
            if (!user) {
                throw new UnauthorizedException('Email is incorrect');
            }

            // Valido la contraseña
            const isPasswordValid = await bcrypt.compare(loginDto.contraseña, user.contraseña);
            if (!isPasswordValid) {
                throw new UnauthorizedException('password is incorrect');
            }

            const payload = {email: user.email} // Que datos van a viajar en el token
            const token = await this.jwtService.signAsync(payload); // Firma el token
                

            return {email:user.email, token};
        }

}
