import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, ValidateNested } from 'class-validator';

// Define la forma de cada objeto en el array
class ProveedorVinculadoDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    proveedorId: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsNotEmpty()
    precioCompra: number;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    codigoProveedor?: string;
}

// DTO principal que espera un array de los objetos de arriba
export class UpdateProveedoresDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProveedorVinculadoDto)
    proveedores: ProveedorVinculadoDto[];
}