import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { RolUsuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Obtiene los roles requeridos para la ruta desde el decorador @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si la ruta no tiene un decorador @Roles(), permite el acceso.
        if (!requiredRoles) {
            return true;
        }

        // Obtiene el objeto 'user' que el AuthGuard (JWT) añadió a la petición.
        const { user } = context.switchToHttp().getRequest();

        // Comprueba si el rol del usuario está incluido en la lista de roles requeridos.
        return requiredRoles.some((role) => user.rol === role);
    }
}