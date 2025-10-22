import { IsNotEmpty, IsPositive, IsInt } from "class-validator";

export class CreateDetalleVentaDto {
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    id_producto : number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    cantidad : number;
}
