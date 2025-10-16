// src/lineas/dto/create-linea.dto.ts
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateLineaDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    readonly nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    readonly descripcion?: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    readonly id_marca: number;
}