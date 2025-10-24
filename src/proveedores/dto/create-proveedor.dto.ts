import { IsEmail, IsNotEmpty, IsOptional, IsString, Max, MaxLength } from "class-validator";


export class CreateProveedorDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    readonly nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(45)
    readonly telefono?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(100)
    readonly email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    readonly direccion: string;


}
