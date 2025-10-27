import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from 'src/usuario/usuario.service';
import { jwtContains } from '../constants/jwt.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usuarioService: UsuarioService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtContains.secret,
        });
    }

    async validate(payload: { sub: number; email: string; rol: string }) {
        const user = await this.usuarioService.findOne(payload.sub); // Busca al usuario por su ID
        if (!user) {
            throw new UnauthorizedException('Token no válido o usuario inexistente.');
        }
        // El objeto 'user' se adjuntará a la request (req.user)
        return user;
    };
}