import { BadRequestException, Get, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/jwt-auth.guard';

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
        
            const payload = { 
                sub: user.id_usuario,
                email: user.email,
                rol: user.rol
            }; 
            
            const token = await this.jwtService.signAsync(payload); // Firma el token
                
            // Devolvemos el token y los datos que quieras (email no es necesario si ya está en el token)
            return { 
                message: "Login successful",
                access_token: token 
            };
        }

        @Get('validate')
        @UseGuards(AuthGuard)
        profile(){
            return 'profile'
        }

}
