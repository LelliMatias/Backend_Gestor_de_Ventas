import { ArrayMinSize } from "class-validator";
import { CreateDetalleVentaDto } from "src/detalle_venta/dto/create-detalle_venta.dto";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsInt, IsPositive, ValidateNested } from "class-validator";

export class CreateVentaDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateDetalleVentaDto)
    detalles : CreateDetalleVentaDto[];
}
