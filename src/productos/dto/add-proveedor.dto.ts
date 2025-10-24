import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class AddProveedorDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    readonly proveedorId: number;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    readonly codigoProveedor?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsNotEmpty()
    readonly precioCompra: number;
}