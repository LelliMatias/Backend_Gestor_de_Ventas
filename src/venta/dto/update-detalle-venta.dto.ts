import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para cada item en la lista de detalles
class DetalleModificadoDto {
  @IsInt()
  @IsPositive()
  id_producto: number;

  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class UpdateVentaDetallesDto {
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto del array
  @Type(() => DetalleModificadoDto)
  detalles: DetalleModificadoDto[]; // La *nueva* lista completa de detalles

  @IsString()
  @IsOptional()
  motivo: string; // Motivo de la edición (para el historial)
}