// src/marcas/dto/create-marca.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMarcaDto {
    @IsString({ message: 'El nombre debe ser un texto.' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
    @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres.' })
    readonly nombre: string;
}