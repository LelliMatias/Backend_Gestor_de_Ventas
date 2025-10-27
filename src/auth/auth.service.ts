import { BadRequestException, Get, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { RolUsuario } from 'src/usuario/entities/usuario.entity';

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

        // --- INICIO DE LA MODIFICACIÓN ---

        // NO hasheamos la contraseña aquí.
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(registerDto.contraseña, salt);

        const createUsuarioDto: CreateUsuarioDto = {
            nombre: registerDto.nombre,
            email: registerDto.email,
            contraseña: registerDto.contraseña, // <--- Pasa la contraseña en texto plano
            rol: RolUsuario.VENDEDOR
        };

        // --- FIN DE LA MODIFICACIÓN ---

        // Ahora, 'usuarioService.create' (que asumo que SÍ hashea)
        // recibirá '123456', lo hasheará 1 sola vez y lo guardará.
        return await this.usuarioService.create(createUsuarioDto);
    }    // auth.service.ts

    async login(loginDto: LoginDto) {
        const user = await this.usuarioService.findOneByEmail(loginDto.email);

        // --- FLAG 1 (Usuario no existe) ---
        if (!user) {
            // Este es el mensaje que enviaremos al frontend
            throw new UnauthorizedException('Usuario no encontrado con ese email');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.contraseña, user.contraseña);

        // --- FLAG 2 (Contraseña no coincide) ---
        if (!isPasswordValid) {
            // Este es el otro mensaje
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        // ... (El resto de tu lógica de login sigue igual) ...
        const payload = {
            sub: user.id_usuario,
            email: user.email,
            rol: user.rol
        }
        const token = await this.jwtService.signAsync(payload);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contraseña, ...userWithoutPassword } = user;

        return {
            token: token,
            user: userWithoutPassword
        };
    }

}
