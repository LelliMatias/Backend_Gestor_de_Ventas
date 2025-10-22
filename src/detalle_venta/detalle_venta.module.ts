import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVenta } from './entities/detalle_venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta])],
  exports: [TypeOrmModule]
})
export class DetalleVentaModule {}
