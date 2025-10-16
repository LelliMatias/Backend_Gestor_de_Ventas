// src/productos/dto/create-producto.dto.ts
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, IsPositive, Min, IsInt } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    readonly nombre: string;

    @IsString()
    @IsOptional()
    readonly descripcion?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsNotEmpty()
    readonly precio_unitario: number;

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    readonly stock_actual: number;

    @IsString()
    @IsOptional()
    readonly imagen?: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    readonly id_linea: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    readonly id_marca: number;
}