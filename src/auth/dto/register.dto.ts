import { IsEmail, IsString, MinLength, IsEnum, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { RolUsuario } from "../../usuario/entities/usuario.entity";

export class RegisterDto {
    @Transform(({ value }) => value.trim()) // limpio espacios en blanco para eviar que ingrese unicamente espacios en blanco
    @IsString()
    @MinLength(3)
    nombre: string;

    @IsString()
    @IsEmail()
    email: string;
    
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    contraseña: string;  
    
    @IsEnum(RolUsuario)
    @IsNotEmpty()
    rol: RolUsuario;
}
