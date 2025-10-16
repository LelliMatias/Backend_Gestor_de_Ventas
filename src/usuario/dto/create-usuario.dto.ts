import { IsString, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'La contraseña debe tener al menos 5 caracteres' })
    contraseña: string;

    @IsEnum(RolUsuario)
    @IsNotEmpty()
    rol: RolUsuario;
}